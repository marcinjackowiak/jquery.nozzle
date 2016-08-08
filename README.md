# jquery.nozzle
Simple data filtering and manipulation library

## Examples

### $.nozzle.liveFilter

```javascript

afterFilter = function(data) {
	console.log(data);
}

$.nozzle.liveFilter({
	filterCallback: afterFilter,
	data: data,
	filters: [
			{
				attribute: 'title',
				value: $('input[name=title_input]')
			},{
				attribute: 'desc',                       
				value: $('input[name=desc_input]')
			},{
				attribute: 'title',
				value: $('select[name=title_select]'),
				match: 'exact'
			}
		]
});
```


