declare module '*.svg' {
  import * as React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
declare module 'react-native-vector-icons/Ionicons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default Icon;
}
declare module 'react-native-keep-awake' {
  const KeepAwake: {
    activate: () => void;
    deactivate: () => void;
  };

  export default KeepAwake;
}
