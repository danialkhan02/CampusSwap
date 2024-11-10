// eslint-disable-next-line max-classes-per-file
import { KeyboardArrowDown, KeyboardArrowUp, SvgIconComponent } from '@mui/icons-material';


export enum ECategory {
    CATEGORY_TEXTBOOKS = 'TEXTBOOKS',
    CATEGORY_ELECTRONICS = 'ELECTRONICS',
    CATEGORY_FURNITURE= 'FURNITURE',
    CATEGORY_CLOTHING = 'CLOTHING',
    CATEGORY_SCHOOL_SUPPLIES = 'SCHOOL_SUPPLIES',
    CATEGORY_SPORTS_EQUIPMENT = 'SPORTS_EQUIPMENT',
    CATEGORY_MUSICAL_INSTRUMENTS = 'MUSICAL_INSTRUMENTS',
    CATEGORY_OTHER = 'OTHER',
}

export enum ECondition {
    CONDITION_NEW = 'CONDITION_NEW',
    CONDITION_USED = 'CONDITION_USED',
}

export enum ESort {
  priceAscending= 'price_asc',
  priceDescending = 'price_desc',
  createdAtAscending = 'created_at_asc',
  createdAtDescending = 'created_at_desc',
}

export interface IStatus<T> {
    key: T;
    title: string;
    icon?: SvgIconComponent;
}

class CategoryParser {
  public readonly TEXTBOOKS: IStatus<ECategory> = {
    key: ECategory.CATEGORY_TEXTBOOKS,
    title: 'Textbook',
  };

  public readonly ELECTRONICS: IStatus<ECategory> = {
    key: ECategory.CATEGORY_ELECTRONICS,
    title: 'Electronics',
  };

  public readonly FURNITURE: IStatus<ECategory> = {
    key: ECategory.CATEGORY_FURNITURE,
    title: 'Furniture',
  };

  public readonly CLOTHING: IStatus<ECategory> = {
    key: ECategory.CATEGORY_CLOTHING,
    title: 'Clothing',
  };

  public readonly SCHOOL_SUPPLIES: IStatus<ECategory> = {
    key: ECategory.CATEGORY_SCHOOL_SUPPLIES,
    title: 'School Supplies',
  };

  public readonly SPORTS_EQUIPMENT: IStatus<ECategory> = {
    key: ECategory.CATEGORY_SPORTS_EQUIPMENT,
    title: 'Sports Equipment',
  };

  public readonly MUSICAL_INSTRUMENTS: IStatus<ECategory> = {
    key: ECategory.CATEGORY_MUSICAL_INSTRUMENTS,
    title: 'Musical Instruments',
  };

  public readonly OTHER: IStatus<ECategory> = {
    key: ECategory.CATEGORY_OTHER,
    title: 'Other',
  };

  public readonly parse = (status: ECategory): IStatus<ECategory> => {
    switch (status) {
      case ECategory.CATEGORY_TEXTBOOKS:
        return this.TEXTBOOKS;
      case ECategory.CATEGORY_ELECTRONICS:
        return this.ELECTRONICS;
      case ECategory.CATEGORY_FURNITURE:
        return this.FURNITURE;
      case ECategory.CATEGORY_CLOTHING:
        return this.CLOTHING;
      case ECategory.CATEGORY_SCHOOL_SUPPLIES:
        return this.SCHOOL_SUPPLIES;
      case ECategory.CATEGORY_SPORTS_EQUIPMENT:
        return this.SPORTS_EQUIPMENT;
      case ECategory.CATEGORY_MUSICAL_INSTRUMENTS:
        return this.MUSICAL_INSTRUMENTS;
      case ECategory.CATEGORY_OTHER:
        return this.OTHER;
      default:
        return this.OTHER;
    }
  };

  public readonly parseFromTitle = (title: string): ECategory => {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('textbook')) return this.TEXTBOOKS.key;
    if (lowerCaseTitle.includes('electronics')) return this.ELECTRONICS.key;
    if (lowerCaseTitle.includes('furniture')) return this.FURNITURE.key;
    if (lowerCaseTitle.includes('clothing')) return this.CLOTHING.key;
    if (lowerCaseTitle.includes('school supplies')) return this.SCHOOL_SUPPLIES.key;
    if (lowerCaseTitle.includes('sports equipment')) return this.SPORTS_EQUIPMENT.key;
    if (lowerCaseTitle.includes('musical instruments')) return this.MUSICAL_INSTRUMENTS.key;
    if (lowerCaseTitle.includes('other')) return this.OTHER.key;
    return ECategory.CATEGORY_OTHER;
  };
}

export const categoryParsed = new CategoryParser();

class ConditionParser {
  public readonly NEW: IStatus<ECondition> = {
    key: ECondition.CONDITION_NEW,
    title: 'New',
  };

  public readonly USED: IStatus<ECondition> = {
    key: ECondition.CONDITION_USED,
    title: 'Used',
  };

  public readonly parse = (status: ECondition): IStatus<ECondition> => {
    switch (status) {
      case ECondition.CONDITION_NEW:
        return this.NEW;
      case ECondition.CONDITION_USED:
        return this.USED;
      default:
        return this.NEW;
    }
  };
}

export const conditionParsed = new ConditionParser();

class SortParser {
  public readonly createdAtAscending: IStatus<ESort> = {
    key: ESort.createdAtAscending,
    title: 'Date Posted',
    icon: KeyboardArrowUp,
  };

  public readonly createdAtDescending: IStatus<ESort> = {
    key: ESort.createdAtDescending,
    title: 'Date Posted',
    icon: KeyboardArrowDown,
  };

  public readonly priceAscending: IStatus<ESort> = {
    key: ESort.priceAscending,
    title: 'Price',
    icon: KeyboardArrowUp,
  };

  public readonly priceDescending: IStatus<ESort> = {
    key: ESort.priceDescending,
    title: 'Price',
    icon: KeyboardArrowDown,
  };

  public readonly parse = (status: ESort): IStatus<ESort> => {
    switch (status) {
      case ESort.createdAtAscending:
        return this.createdAtAscending;
      case ESort.createdAtDescending:
        return this.createdAtDescending;
      case ESort.priceAscending:
        return this.priceAscending;
      case ESort.priceDescending:
        return this.priceAscending;
      default:
        return this.createdAtDescending;
    }
  };
}

export const sortingParsed = new SortParser();
