import * as  React from "react";
import colorstyles from "./ColorPicker.module.scss";
import { IColorPickerProps, IColorPickerState } from '../../../../../../../interfaces/index';
import reactCSS from 'reactcss';
import { SketchPicker } from 'react-color';
import hexToRgba from 'hex-to-rgba';

export default class ColorPicker extends React.Component<IColorPickerProps, IColorPickerState> {
    private isDirty: boolean;
    private isDefaultColor : boolean;
    constructor(props) {
        super(props);
        this.isDirty = false;
        this.state = {
            displayColorPicker: false,
            color: this.converthexTorbg(props.displayColor),
            isDefaultColor:false
        };        
    }

    public componentWillReceiveProps(props){
        this.setState({
            color: this.converthexTorbg(props.displayColor)
        });
    }

    public converthexTorbg(color:string){
        let rgba = {  r: '255',
                        g: '255',
                        b: '255',
                        a: '0.5'
                    };
        
        if(color){
            let colorColl = hexToRgba(color);
            let splitColor = colorColl.split('(')[1].split(')')[0].split(',');
            rgba.r =splitColor[0];
            rgba.g =splitColor[1];
            rgba.b =splitColor[2];
            rgba.a =splitColor[3];
            console.log(colorColl);
            this.isDefaultColor=false;
            // this.setState({
            //     isDefaultColor:false
            // });            
        }    
        else{
            // this.setState({
            //     isDefaultColor:true
            // });
            rgba = {  r: '255',
                        g: '255',
                        b: '255',
                        a: '0.5'
                    };
            this.isDefaultColor=true;
        }   
        return rgba;
    } 

    public handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
    }

    public handleClose = () => {
        this.setState({ displayColorPicker: false });
    }

    public handleChange = (color) => {
        this.props.onChangeColor(color.hex);
        this.isDefaultColor=false;
        this.setState({ color: color.rgb });

    }

    public render(): React.ReactElement<IColorPickerProps> {
        const styles = reactCSS({
            'default': {
              color: {
                width: '36px',
                height: '14px',
                borderRadius: '2px',
                background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
              },
              swatch: {
                padding: '5px',
                background: '#fff',
                borderRadius: '1px',
                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                display: 'inline-block',
                cursor: 'pointer',
              },
              popover: {
                position: 'absolute',
                zIndex: '2',
              },
              cover: {
                 position: 'fixed',
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
              },
            },
          });
        return (
            <div>
                <div style={ styles.swatch } onClick={ this.handleClick }>  
                {this.isDefaultColor ?  <div style={ styles.color } >No Color</div> :  <div style={ styles.color } ></div>}                  
                   
                </div>
                { this.state.displayColorPicker ? <div style={ styles.popover }>
                <div style={ styles.cover } onClick={ this.handleClose }/>
                    <SketchPicker color={ this.state.color } onChange={ this.handleChange } />
                </div> : null }
    
            </div>
        );
    }
}