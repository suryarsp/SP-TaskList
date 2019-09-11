export interface IColorPickerState{
    displayColorPicker: boolean;
    isDefaultColor:boolean;
    color: {
      r:string,
      g: string,
      b: string,
      a:string,
    };
    
}