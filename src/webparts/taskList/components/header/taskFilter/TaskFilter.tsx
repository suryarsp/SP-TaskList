import * as React from 'react';
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import TaskDataProvider from  '../../../../../services/TaskDataProvider';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { ITaskFilterProps,ITaskFilterState, IDataProvider, IGroup } from '../../../../../interfaces/index';
import _ from 'lodash';
import {  css } from 'office-ui-fabric-react';
require("../../../../../styles/main.css");

const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 300 }
  };

export default class TaskFilter extends React.Component<ITaskFilterProps ,ITaskFilterState> {
    private dataProvider: IDataProvider;
    private options: IDropdownOption[]=[];
    constructor(props:ITaskFilterProps){
        super(props);
        this.state = {
            groups:[],
            selectedGroup:null,
            searchedValue:''
        };
    }
    public componentDidMount() {
        this.dataProvider = TaskDataProvider.Instance;
        const {groupListName}=TaskDataProvider.listNames;
        this.dataProvider.getGroups(groupListName).then((groups)=>{
            this.setState({
                groups:groups
            });
        });
        console.log(this.options);
    }
    private onChangeSearch(newValue:string){
            if(newValue.length > 0) {
                this.setState({
                    searchedValue:newValue
                });
            } else {
                this.onClearSearchText();
            }
    }
    private onChangeGroup(event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number){        
        this.setState({
            selectedGroup:option
        });       
    }

    private onClearSearchText() {
        this.setState({
            searchedValue: ''
        });
    }

    public render(): React.ReactElement<ITaskFilterProps> {
        const {groups,searchedValue, selectedGroup} = this.state;
        const defaultKey  = groups.length > 0 ? groups.filter(c => c.IsDefault)[0].Title : "";
        
        
      return (       
            <div className={css("ms-Grid")}>    
                <div className={css("ms-Grid-row") } style={{ marginBottom: '10px' }}>
                    <div className={css("ms-Grid-col ms-sm4") } >
                        <Dropdown  
                            label="Task Group"
                            options={groups} 
                            selectedKey={selectedGroup ? selectedGroup.title : ""}
                            defaultSelectedKey={defaultKey}
                            onChange={this.onChangeGroup.bind(this)}
                            //value={this.state.selectedGroup}
                            //styles={dropdownStyles} 
                        /> 
                    </div>
                    <div className={css("ms-Grid-col ms-sm6") } style={{ marginTop: '29px', borderRadius: '5px' }}>
                        <SearchBox
                            placeholder="Search"
                            value={searchedValue}
                            style={{ borderRadius: '20px' }}
                            //style={{padding: '20px'}}
                            onClear = {this.onClearSearchText.bind(this)}
                            onChange={this.onChangeSearch.bind(this)}
                        />
                    </div>
                </div>
            </div>
          
        );
    }
  }
