var expect = require('chai').expect;
global.document = require('jsdom').jsdom('<html></html>');
global.window = document.defaultView;
global.jQuery = require('jquery');
global.$ = jQuery;
require('../src/jquery.nozzle.js');

 describe("$.nozzle.filterData", function() {   
               
        var samples = [
            {
                title: "Item 1",
                desc: "This is item 1"
            },
            {
                title: "Item 2",
                desc: "This is description for Item 2"
            },
            {
                title: "Item 2a",
                desc: "This is 2a"
            },
            {
                title: "Item 2A",
                desc: "This is 2A"
            },          
            {
                title: "Item 3",
                desc: "This is description for Item 3"
            },
            {
                title: "This is reversed",
                desc: "Similar to Item 2a"
            }
        ];  

        it("Single filter default", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title',
                    value: '1'
                }]
            );
            expect(result.length).to.equal(1);
            expect(result[0]['title']).to.equal('Item 1');
        });
        
        it("Single filter default match case", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title',
                    value: 'a',
                    matchCase: true
                }]
            );
            expect(result.length).to.equal(1);
            expect(result[0]['title']).to.equal('Item 2a');
        });        

        it("Single filter multiple attributes", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title, desc',
                    value: '2a'
                }]
            );
            expect(result.length).to.equal(3);
            expect(result[0]['title']).to.equal('Item 2a');
        });
        
        it("Single filter multiple attributes match case", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title, desc',
                    value: '2a',
                    matchCase: true
                }]
            );
            expect(result.length).to.equal(2);
            expect(result[0]['title']).to.equal('Item 2a');
        });        

        it("Single filter contains", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title',
                    value: '1',
                    match: 'contains'
                }]
            );
            expect(result.length).to.equal(1);
            expect(result[0]['title']).to.equal('Item 1');
        });

        it("Single filter startsWith", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title',
                    value: 'Item 2',
                    match: 'startsWith'
                }]
            );
            expect(result.length).to.equal(3);
            expect(result[1]['title']).to.equal('Item 2a');
        });      
     
        it("Single filter endsWith", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title',
                    value: '2',
                    match: 'endsWith'
                }]
            );
            expect(result.length).to.equal(1);
            expect(result[0]['title']).to.equal('Item 2');
        });      
        
        it("Single filter regex", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title',
                    value: '^.*A$',
                    match: 'regex'
                }]
            );
            expect(result.length).to.equal(2);
            expect(result[0]['title']).to.equal('Item 2a');
        });             

        it("Single filter regex match case", function() {                 
            var result = $.nozzle.filterData(
                samples,
                [{
                    attribute: 'title',
                    value: '^.*A$',
                    match: 'regex',
                    matchCase: true
                }]
            );
            expect(result.length).to.equal(1);
            expect(result[0]['title']).to.equal('Item 2A');
        });             

});

