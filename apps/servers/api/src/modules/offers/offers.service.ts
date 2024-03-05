import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository } from '@tradeyard-v2/server/database';
import { Repository } from 'typeorm';

@Injectable()
export class OffersService {
  get(dto) {
    return this.offerRepository.findOneOrFail({ where: { id: dto.id } });
  }

  getMany(dtos) {
    return this.offerRepository.find();
  }

  create(dto) {
    return this.eventRepository.publish('offer:created', {});
  }

  bulkCreate(dtos) {}

  update(dto) {}

  bulkUpdate(dto) {}

  archive(dto) {}

  bulkArchive(dtos) {}

  constructor(
    @InjectRepository(OfferViewEntity)
    private readonly offerRepository: Repository<OfferViewEntity>,
    private readonly eventRepository: EventRepository
  ) {}
}
