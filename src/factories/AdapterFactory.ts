import { BaseFormAdapter } from '../adapters/BaseFormAdapter';
import { MuiFormAdapter } from '../adapters/mui/MuiFormAdapter';

export type FrameworkType = 'mui' | 'bootstrap' | 'antd';

export class AdapterFactory {
  static createAdapter(framework: FrameworkType): BaseFormAdapter {
    switch (framework) {
      case 'mui':
        return new MuiFormAdapter();
      // Add more framework adapters here as needed
      default:
        return new MuiFormAdapter();
    }
  }
}
