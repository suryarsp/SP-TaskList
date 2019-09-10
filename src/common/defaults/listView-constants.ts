export const ListDetailsConstants :
{
group: {
  listViews: Array<string>
},
category: {
  listViews: Array<string>
},
status: {
  listViews: Array<string>
},
responsibleParty: {
  listViews: Array<string>
},
comments: {
  listViews: Array<string>
},
task: {
  listViews: Array<string>
}
} = {
  group: {
    listViews: ['Item', 'Title', 'SortOrder', 'IsDefault', 'ID', 'Created', 'Editor', 'Modified']
  },
  category: {
    listViews: ['Item', 'Title', 'SortOrder','Parent', 'Group', 'ID', 'Created', 'Editor', 'Modified']
  },
  responsibleParty: {
    listViews:  ['Item', 'Title', 'FontColor', 'FillColor', 'ID', 'Created', 'Editor', 'Modified']
  },
  status: {
    listViews: ['Item', 'Title', 'SortOrder','FontColor', 'FillColor', 'ID', 'Created', 'Editor', 'Modified']
  },
  comments: {
    listViews: ['Item', 'Title', 'Comment','Task', 'Created', 'Editor', 'Modified']
  },
  task: {
    listViews: ['Item', 'Title', 'SortOrder','Parent', 'Group','Category', 'Status','Document','ID', 'Created', 'Editor', 'Modified']
  }
};
