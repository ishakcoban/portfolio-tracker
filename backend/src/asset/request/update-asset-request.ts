import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetRequest } from './create-asset-request';

export class UpdateAssetRequest extends PartialType(CreateAssetRequest) {}
