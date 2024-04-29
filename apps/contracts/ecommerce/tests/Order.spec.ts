import {
  time,
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import {
  Address,
  getAddress,
  parseEther,
  stringToHex,
  zeroAddress,
} from 'viem';

import chai from 'chai';
import promises from 'chai-as-promised';
import '@nomicfoundation/hardhat-toolbox-viem';

chai.use(promises);

enum OrderStatus {
  Created,
  CustomerDeposit,
  CustomerRelease,
  CustomerComplaint,
  MerchantConfirmed,
  MerchantCancelled,
  MerchantShipping,
  MerchantShipped,
  MerchantRelease,
  MerchantComplaint,
  ModeratorComplaintReleased,
  ModeratorComplaintRefunded,
  Closed,
}

type OrderStatusLiteral = keyof typeof OrderStatus;

const OrderKeys = Object.keys(OrderStatus) as OrderStatusLiteral[];

describe('Order', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  function createOrderFixture(options: { ierc20: boolean }) {
    return async function deployOrderFixture() {
      // Contracts are deployed using the first signer/account by default
      const [owner, customer, merchant] = await hre.viem.getWalletClients();

      const orderIdHash = stringToHex('test-order-id', { size: 32 });
      const orderTimeoutInSeconds = 14n * 24n * 3600n;

      const ownerToken = await hre.viem.deployContract('TestToken');
      const tokenAmount = parseEther('1');
      const customerToken = await hre.viem.getContractAt(
        'TestToken',
        ownerToken.address,
        { client: { wallet: customer } }
      );
      const merchantToken = await hre.viem.getContractAt(
        'TestToken',
        ownerToken.address,
        { client: { wallet: merchant } }
      );

      await ownerToken.write.mint([customer.account.address, tokenAmount]);

      const ownerContract = await hre.viem.deployContract('Order', [
        customer.account.address,
        merchant.account.address,
        tokenAmount,
        options.ierc20 ? ownerToken.address : zeroAddress,
        orderTimeoutInSeconds,
        orderIdHash,
      ]);

      const customerContract = await hre.viem.getContractAt(
        'Order',
        ownerContract.address,
        { client: { wallet: customer } }
      );
      const merchantContract = await hre.viem.getContractAt(
        'Order',
        ownerContract.address,
        { client: { wallet: merchant } }
      );

      const publicClient = await hre.viem.getPublicClient();
      const escrowAddress = await ownerContract.read.getEscrowAddress();

      return {
        order: {
          asOwner: ownerContract,
          asCustomer: customerContract,
          asMerchant: merchantContract,
        },
        token: {
          asOwner: ownerToken,
          asCustomer: customerToken,
          asMerchant: merchantToken,
        },
        tokenAmount,
        tokenAddress: ownerToken.address,
        orderTimeoutInSeconds,
        escrowAddress,
        wallets: { owner, customer, merchant },
        publicClient,
        orderIdHash,
        getERC20Balances: async () => ({
          contract: await ownerToken.read.balanceOf([ownerContract.address]),
          customer: await ownerToken.read.balanceOf([customer.account.address]),
          escrow: await ownerToken.read.balanceOf([escrowAddress]),
          merchant: await ownerToken.read.balanceOf([merchant.account.address]),
          owner: await ownerToken.read.balanceOf([owner.account.address]),
        }),
        getBalances: async () => ({
          contract: await publicClient.getBalance(owner.account),
          customer: await publicClient.getBalance(customer.account),
          escrow: await publicClient.getBalance({
            address: escrowAddress as Address,
          }),
          merchant: await publicClient.getBalance(merchant.account),
          owner: await publicClient.getBalance(owner.account),
        }),
      };
    };
  }

  describe('Deployment', function () {
    it('Should OrderStatus be "Created"', async function () {
      const { order } = await loadFixture(createOrderFixture({ ierc20: true }));

      expect(await order.asOwner.read.getOrderStatus()).to.equal(0);
    });

    it('Should set the right owner', async function () {
      const { order, wallets } = await loadFixture(
        createOrderFixture({ ierc20: true })
      );

      expect(await order.asOwner.read.owner()).to.equal(
        getAddress(wallets.owner.account.address)
      );
    });

    it('Should set the right customer', async function () {
      const { order, wallets } = await loadFixture(
        createOrderFixture({ ierc20: true })
      );

      expect(await order.asOwner.read.getCustomerAddress()).to.equal(
        getAddress(wallets.customer.account.address)
      );
    });

    it('Should set the right merchant', async function () {
      const { order, wallets } = await loadFixture(
        createOrderFixture({ ierc20: true })
      );

      expect(await order.asOwner.read.getMerchantAddress()).to.equal(
        getAddress(wallets.merchant.account.address)
      );
    });

    it('Should set escrow account', async function () {
      const { order, wallets } = await loadFixture(
        createOrderFixture({ ierc20: true })
      );

      expect(await order.asOwner.read.getEscrowAddress()).not.to.be.undefined;
    });
  });

  describe('Transitions (ERC20)', function () {
    describe('From "Created" to "MerchantRelease"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: true }));
      });

      describe('From "Created"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.Created}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should ONLY transition to "CustomerDeposit"', async () => {
          const {
            order,
            token,
            tokenAmount,
            tokenAddress,
            escrowAddress,
            wallets,
          } = await fixture;

          await token.asCustomer.write.approve([
            order.asOwner.address,
            tokenAmount,
          ]);
          await order.asCustomer.write.deposit();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.CustomerDeposit
          );
          expect(
            await token.asOwner.read.balanceOf([
              wallets.customer.account.address,
            ])
          ).to.equal(0n);
          expect(await token.asOwner.read.balanceOf([tokenAddress])).to.equal(
            0n
          );
          expect(await token.asOwner.read.balanceOf([escrowAddress])).to.equal(
            tokenAmount
          );
        });
      });

      describe('From "CustomerDeposit"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.CustomerDeposit}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should transition to "MerchantConfirmed"', async () => {
          const { order } = fixture;

          await order.asMerchant.write.confirm();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantConfirmed
          );
        });
      });

      describe('From "MerchantConfirmed"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.MerchantConfirmed}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should transition to "MerchantShipping"', async () => {
          const { order } = fixture;

          await order.asMerchant.write.shipping();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantShipping
          );
        });
      });

      describe('From "MerchantShipping"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.MerchantShipping}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should transition to "MerchantShipped"', async () => {
          const { order } = fixture;

          await order.asMerchant.write.shipped();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantShipped
          );
        });
      });

      describe('From "MerchantShipped"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.MerchantShipped}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should REVERT transition to "MerchantRelease" with "RedemptionPeriodNotOverYet" reason', async () => {
          const { order, orderTimeoutInSeconds } = fixture;
          const lastTransitionAt =
            await order.asOwner.read.getLastTransitionAt();

          await expect(order.asMerchant.write.release()).to.be.rejectedWith(
            `RedemptionPeriodNotOverYet(${
              lastTransitionAt + orderTimeoutInSeconds
            })`
          );
        });

        it('Should transition to "MerchantRelease" only after timeout', async () => {
          const { order, orderTimeoutInSeconds } = fixture;
          const lastTransitionAt =
            await order.asOwner.read.getLastTransitionAt();

          time.increaseTo(lastTransitionAt + orderTimeoutInSeconds);

          await order.asMerchant.write.release();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantRelease
          );
        });
      });
    });
    describe('From "Created" to "MerchantCancelled"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: true }));
      });

      it('Should transition to "CustomerDeposit"', async () => {
        const {
          order,
          token,
          tokenAmount,
          tokenAddress,
          escrowAddress,
          wallets,
        } = await fixture;

        await token.asCustomer.write.approve([
          order.asOwner.address,
          tokenAmount,
        ]);
        await order.asCustomer.write.deposit();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerDeposit
        );
        expect(
          await token.asOwner.read.balanceOf([wallets.customer.account.address])
        ).to.equal(0n);
        expect(
          await token.asOwner.read.balanceOf([wallets.merchant.account.address])
        ).to.equal(0n);
        expect(await token.asOwner.read.balanceOf([tokenAddress])).to.equal(0n);
        expect(await token.asOwner.read.balanceOf([escrowAddress])).to.equal(
          tokenAmount
        );
      });

      it('Should transition to "MerchantCancelled"', async () => {
        const {
          token,
          tokenAddress,
          tokenAmount,
          escrowAddress,
          order,
          wallets,
        } = fixture;

        await order.asMerchant.write.cancel();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.MerchantCancelled
        );

        expect(
          await token.asOwner.read.balanceOf([wallets.customer.account.address])
        ).to.equal(tokenAmount);
        expect(
          await token.asOwner.read.balanceOf([wallets.merchant.account.address])
        ).to.equal(0n);
        expect(await token.asOwner.read.balanceOf([tokenAddress])).to.equal(0n);
        expect(await token.asOwner.read.balanceOf([escrowAddress])).to.equal(
          0n
        );
      });
    });

    describe('From "Created" through "CustomerComplaint" to "ModeratorComplaintReleased"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: true }));
      });

      it('Should transition to "CustomerDeposit"', async () => {
        const { order, token, tokenAmount, getERC20Balances } = fixture;

        await token.asCustomer.write.approve([
          order.asOwner.address,
          tokenAmount,
        ]);
        await order.asCustomer.write.deposit();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerDeposit
        );

        expect(await getERC20Balances()).to.deep.equal({
          customer: 0n,
          merchant: 0n,
          owner: 0n,
          escrow: tokenAmount,
          contract: 0n,
        });
      });

      it('Should transition to "CustomerComplaint"', async () => {
        const { order } = fixture;

        await order.asCustomer.write.submitComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerComplaint
        );
      });

      it('Should NOT transition to "ModeratorComplaintReleased" with OwnableUnauthorizedAccount revert', async () => {
        const { order } = fixture;

        await expect(
          order.asCustomer.write.releaseComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');

        await expect(
          order.asMerchant.write.releaseComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');
      });

      it('Should transition to "ModeratorComplaintReleased"', async () => {
        const { order, tokenAmount, getERC20Balances } = fixture;

        await order.asOwner.write.releaseComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.ModeratorComplaintReleased
        );

        expect(await getERC20Balances()).to.deep.equal({
          customer: 0n,
          merchant: tokenAmount,
          owner: 0n,
          escrow: 0n,
          contract: 0n,
        });
      });
    });

    describe('From "Created" through "CustomerComplaint" to "ModeratorComplaintRefunded"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: true }));
      });

      it('Should transition to "CustomerDeposit"', async () => {
        const { order, token, tokenAmount, getERC20Balances } = fixture;

        await token.asCustomer.write.approve([
          order.asOwner.address,
          tokenAmount,
        ]);
        await order.asCustomer.write.deposit();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerDeposit
        );

        expect(await getERC20Balances()).to.deep.equal({
          customer: 0n,
          merchant: 0n,
          owner: 0n,
          escrow: tokenAmount,
          contract: 0n,
        });
      });

      it('Should transition to "CustomerComplaint"', async () => {
        const { order } = fixture;

        await order.asCustomer.write.submitComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerComplaint
        );
      });

      it('Should NOT transition to "ModeratorComplaintRefunded" with OwnableUnauthorizedAccount revert', async () => {
        const { order } = fixture;

        await expect(
          order.asCustomer.write.refundComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');

        await expect(
          order.asMerchant.write.refundComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');
      });

      it('Should transition to "ModeratorComplaintRefunded"', async () => {
        const { order, tokenAmount, getERC20Balances } = fixture;

        await order.asOwner.write.refundComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.ModeratorComplaintRefunded
        );

        expect(await getERC20Balances()).to.deep.equal({
          customer: tokenAmount,
          merchant: 0n,
          owner: 0n,
          escrow: 0n,
          contract: 0n,
        });
      });
    });
  });

  describe('Transitions (Native)', function () {
    describe('From "Created" to "MerchantRelease"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: false }));
      });

      describe('From "Created"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.Created}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should ONLY transition to "CustomerDeposit"', async () => {
          const { order, tokenAmount, getBalances } = await fixture;

          const balancesBefore = await getBalances();

          await order.asCustomer.write.deposit([], {
            value: tokenAmount,
          });

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.CustomerDeposit
          );

          const balancesAfter = await getBalances();
          expect(
            balancesBefore.customer - tokenAmount >= balancesAfter.customer
          ).to.be.true;
          expect(balancesAfter).to.deep.equal({
            customer: balancesAfter.customer,
            merchant: balancesBefore.merchant,
            owner: balancesBefore.owner,
            escrow: balancesBefore.escrow + tokenAmount,
            contract: balancesBefore.contract,
          });
        });
      });

      describe('From "CustomerDeposit"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.CustomerDeposit}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should transition to "MerchantConfirmed"', async () => {
          const { order } = fixture;

          await order.asMerchant.write.confirm();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantConfirmed
          );
        });
      });

      describe('From "MerchantConfirmed"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.MerchantConfirmed}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should transition to "MerchantShipping"', async () => {
          const { order } = fixture;

          await order.asMerchant.write.shipping();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantShipping
          );
        });
      });

      describe('From "MerchantShipping"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asCustomer',
            writeMethod: 'release',
            status: 'CustomerRelease',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.MerchantShipping}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should transition to "MerchantShipped"', async () => {
          const { order } = fixture;

          await order.asMerchant.write.shipped();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantShipped
          );
        });
      });

      describe('From "MerchantShipped"', () => {
        [
          {
            orderAs: 'asMerchant',
            writeMethod: 'confirm',
            status: 'MerchantConfirmed',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipping',
            status: 'MerchantShipping',
          },
          {
            orderAs: 'asMerchant',
            writeMethod: 'shipped',
            status: 'MerchantShipped',
          },
        ].forEach(({ orderAs, writeMethod, status }) => {
          it(`Should NOT allow transition to "${status}"`, async () => {
            const { order } = fixture;

            await expect(
              order[orderAs].write[writeMethod]()
            ).to.be.rejectedWith(
              `InvalidStatusTransition(${OrderStatus.MerchantShipped}, ${OrderStatus[status]})`
            );
          });
        });

        it('Should REVERT transition to "MerchantRelease" with "RedemptionPeriodNotOverYet" reason', async () => {
          const { order, orderTimeoutInSeconds } = fixture;
          const lastTransitionAt =
            await order.asOwner.read.getLastTransitionAt();

          await expect(order.asMerchant.write.release()).to.be.rejectedWith(
            `RedemptionPeriodNotOverYet(${
              lastTransitionAt + orderTimeoutInSeconds
            })`
          );
        });

        it('Should transition to "MerchantRelease" only after timeout', async () => {
          const { order, orderTimeoutInSeconds } = fixture;
          const lastTransitionAt =
            await order.asOwner.read.getLastTransitionAt();

          time.increaseTo(lastTransitionAt + orderTimeoutInSeconds);

          await order.asMerchant.write.release();

          expect(await order.asOwner.read.getOrderStatus()).to.equal(
            OrderStatus.MerchantRelease
          );
        });
      });
    });
    describe('From "Created" to "MerchantCancelled"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: false }));
      });

      it('Should transition to "CustomerDeposit"', async () => {
        const { order, tokenAmount, getBalances } = await fixture;

        const balancesBefore = await getBalances();

        await order.asCustomer.write.deposit([], {
          value: tokenAmount,
        });

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerDeposit
        );

        const balancesAfter = await getBalances();
        expect(balancesBefore.customer - tokenAmount >= balancesAfter.customer)
          .to.be.true;
        expect(balancesAfter).to.deep.equal({
          customer: balancesAfter.customer,
          merchant: balancesBefore.merchant,
          owner: balancesBefore.owner,
          escrow: balancesBefore.escrow + tokenAmount,
          contract: balancesBefore.contract,
        });
      });

      it('Should transition to "MerchantCancelled"', async () => {
        const {
          token,
          tokenAddress,
          tokenAmount,
          escrowAddress,
          order,
          wallets,
        } = fixture;

        await order.asMerchant.write.cancel();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.MerchantCancelled
        );

        expect(
          await token.asOwner.read.balanceOf([wallets.customer.account.address])
        ).to.equal(tokenAmount);
        expect(
          await token.asOwner.read.balanceOf([wallets.merchant.account.address])
        ).to.equal(0n);
        expect(await token.asOwner.read.balanceOf([tokenAddress])).to.equal(0n);
        expect(await token.asOwner.read.balanceOf([escrowAddress])).to.equal(
          0n
        );
      });
    });

    describe('From "Created" through "CustomerComplaint" to "ModeratorComplaintReleased"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: false }));
      });

      it('Should transition to "CustomerDeposit"', async () => {
        const { order, token, tokenAmount, getBalances } = fixture;

        const balancesBefore = await getBalances();

        await order.asCustomer.write.deposit([], { value: tokenAmount });

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerDeposit
        );

        const balancesAfter = await getBalances();
        expect(balancesBefore.customer - tokenAmount >= balancesAfter.customer)
          .to.be.true;
        expect(balancesAfter).to.deep.equal({
          customer: balancesAfter.customer,
          merchant: balancesBefore.merchant,
          owner: balancesBefore.owner,
          escrow: balancesBefore.escrow + tokenAmount,
          contract: balancesBefore.contract,
        });
      });

      it('Should transition to "CustomerComplaint"', async () => {
        const { order } = fixture;

        await order.asCustomer.write.submitComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerComplaint
        );
      });

      it('Should NOT transition to "ModeratorComplaintReleased" with OwnableUnauthorizedAccount revert', async () => {
        const { order } = fixture;

        await expect(
          order.asCustomer.write.releaseComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');

        await expect(
          order.asMerchant.write.releaseComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');
      });

      it('Should transition to "ModeratorComplaintReleased"', async () => {
        const { order, tokenAmount, getBalances } = fixture;

        const balancesBefore = await getBalances();
        await order.asOwner.write.releaseComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.ModeratorComplaintReleased
        );

        const balancesAfter = await getBalances();
        expect(balancesAfter).to.deep.equal({
          merchant: balancesBefore.merchant + tokenAmount,
          escrow: balancesBefore.escrow - tokenAmount,
          customer: balancesBefore.customer,
          owner: balancesAfter.owner,
          contract: balancesAfter.contract,
        });
      });
    });

    describe('From "Created" through "CustomerComplaint" to "ModeratorComplaintRefunded"', () => {
      let fixture;
      beforeEach(async () => {
        fixture = fixture
          ? fixture
          : await loadFixture(createOrderFixture({ ierc20: false }));
      });

      it('Should transition to "CustomerDeposit"', async () => {
        const { order, token, tokenAmount, getBalances } = fixture;

        const balancesBefore = await getBalances();
        await order.asCustomer.write.deposit([], { value: tokenAmount });

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerDeposit
        );

        const balancesAfter = await getBalances();
        expect(balancesBefore.customer - tokenAmount >= balancesAfter.customer)
          .to.be.true;
        expect(balancesAfter).to.deep.equal({
          customer: balancesAfter.customer,
          merchant: balancesBefore.merchant,
          owner: balancesBefore.owner,
          escrow: balancesBefore.escrow + tokenAmount,
          contract: balancesBefore.contract,
        });
      });

      it('Should transition to "CustomerComplaint"', async () => {
        const { order } = fixture;

        await order.asCustomer.write.submitComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.CustomerComplaint
        );
      });

      it('Should NOT transition to "ModeratorComplaintRefunded" with OwnableUnauthorizedAccount revert', async () => {
        const { order } = fixture;

        await expect(
          order.asCustomer.write.refundComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');

        await expect(
          order.asMerchant.write.refundComplaint()
        ).to.be.rejectedWith('OwnableUnauthorizedAccount');
      });

      it('Should transition to "ModeratorComplaintRefunded"', async () => {
        const { order, tokenAmount, getBalances } = fixture;

        const balancesBefore = await getBalances();
        await order.asOwner.write.refundComplaint();

        expect(await order.asOwner.read.getOrderStatus()).to.equal(
          OrderStatus.ModeratorComplaintRefunded
        );

        const balancesAfter = await getBalances();
        expect(balancesAfter).to.deep.equal({
          customer: balancesBefore.customer + tokenAmount,
          merchant: balancesBefore.merchant,
          owner: balancesAfter.owner,
          escrow: 0n,
          contract: balancesAfter.contract,
        });
      });
    });
  });
});

// describe('Validations', function () {
//   it('Should revert with the right error if called too soon', async function () {
//     const { lock } = await loadFixture(deployOrderFixture);
//     await expect(lock.write.withdraw()).to.be.rejectedWith(
//       "You can't withdraw yet"
//     );
//   });
//   it('Should revert with the right error if called from another account', async function () {
//     const { lock, unlockTime, otherAccount } = await loadFixture(
//       deployOrderFixture
//     );
//     // We can increase the time in Hardhat Network
//     await time.increaseTo(unlockTime);
//     // We retrieve the contract with a different account to send a transaction
//     const lockAsOtherAccount = await hre.viem.getContractAt(
//       'Lock',
//       lock.address,
//       { client: { wallet: otherAccount } }
//     );
//     await expect(lockAsOtherAccount.write.withdraw()).to.be.rejectedWith(
//       "You aren't the owner"
//     );
//   });
//   it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//     const { lock, unlockTime } = await loadFixture(deployOrderFixture);
//     // Transactions are sent using the first signer by default
//     await time.increaseTo(unlockTime);
//     await expect(lock.write.withdraw()).to.be.fulfilled;
//   });
// });

// describe('Events', function () {
//   it('Should emit an event on withdrawals', async function () {
//     const { lock, unlockTime, lockedAmount, publicClient } =
//       await loadFixture(deployOrderFixture);
//     await time.increaseTo(unlockTime);
//     const hash = await lock.write.withdraw();
//     await publicClient.waitForTransactionReceipt({ hash });
//     // get the withdrawal events in the latest block
//     const withdrawalEvents = await lock.getEvents.Withdrawal();
//     expect(withdrawalEvents).to.have.lengthOf(1);
//     expect(withdrawalEvents[0].args.amount).to.equal(lockedAmount);
//   });
// });
