import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Vendor } from './schemas/vendor.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { Model } from 'mongoose';

@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<Vendor>) {}
  async findById(id: string) {
    return this.vendorModel.findById(id).select('-password');
  }

  async openStore(vendorId: string): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findByIdAndUpdate(vendorId, { isStoreOpen: true }, { new: true })
      .select('-password');

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async closeStore(vendorId: string): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findByIdAndUpdate(vendorId, { isStoreOpen: false }, { new: true })
      .select('-password');

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async updatePackSettings(vendorId: string, packSettings: { limit: number; price: number }): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findByIdAndUpdate(
        vendorId,
        {
          packSettings: { limit: packSettings.limit, price: packSettings.price },
        },
        { new: true }
      )
      .select('-password');
  
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
  
    return vendor;
  }
  


  async findAll() {
    return this.vendorModel.find().select('-password').exec();
  }

  async findVendorBySlug(slug: string) {
    const vendor = await this.vendorModel.findOne({ slug }).select('-password');

    if (!vendor) {
      throw new NotFoundException(`Vendor with slug '${slug}' not found`);
    }

    return {
      _id: vendor._id,
      restaurantName: vendor.restaurantName,
      slug: vendor.slug,
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      description: vendor.description,
      email: vendor.email,
      phoneNumber: vendor.phoneNumber,
      locationName: vendor.locationName,
      address: vendor.address,
      displayImage: vendor.displayImage,
      category: vendor.category,
      isStoreOpen: vendor.isStoreOpen,
    };
  }

  async updateWorkingHours(
    vendorId: string,
    update: { day: string; openingTime?: string; closingTime?: string; isActive?: boolean }
  ): Promise<any> {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
  
    const hours = vendor.workingHours;
    const index = hours.findIndex((h) => h.day.toLowerCase() === update.day.toLowerCase());
    if (index === -1) {
      throw new BadRequestException(`Invalid day: ${update.day}`);
    }
  
    if (update.openingTime) hours[index].openingTime = update.openingTime;
    if (update.closingTime) hours[index].closingTime = update.closingTime;
    if (update.isActive !== undefined) hours[index].isActive = update.isActive;
  
    vendor.workingHours = hours;
    await vendor.save();
  
    return vendor.workingHours;
  }

  async updateVendorProfile(vendorId: string, updateDto: UpdateVendorProfileDto) {
    const vendor = await this.vendorModel.findById(vendorId); // adjust for Prisma/TypeORM as needed
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
  
    Object.assign(vendor, updateDto);
    await vendor.save();
  
    return {
      message: 'Vendor profile updated successfully',
      vendor,
    };
  }
  
  
}
