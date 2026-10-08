import AsyncStorage from '@react-native-async-storage/async-storage';

import { view } from './storybook.requires';

// storybook.requires.ts lo genera withStorybook (metro) o `sb-rn-get-stories`.
const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
