

// URN of the model
var urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c21lYy1wb2MtcmV2aXQvTklGLVNNRS1NT0QtU1QtMjQxMDAxXzE4MDgxNC5ydnQ';

// Descriptors to show on the report
var descriptorsToShow = [
    { descriptor: 'PLV', budget: 30, properties: ['Diameter_LE', 'LengthPile_LE'] },
    { descriptor: 'PLC' ,budget: 70, properties: ['Volume']},
    { descriptor: 'ABH', budget: 48, properties: ['Volume'] },
    { descriptor: 'SLB' },
    { descriptor: 'BPG' },
    { descriptor: 'DES', budget: 85, properties: ['Volume'] }]

// store a list of descriptors and dbIds
var listOfElements = {};

$(document).ready(function () {
    launchViewer(urn);
});

function createReport() {
    $('#report').empty();
    var row =
        '<div class="row" style="margin-bottom:30px">' +
        '<div class="col-sm-3 rowTitle">Quantity item</div>' +
        '<div class="col-sm-3 rowTitle">Graph results</div>' +
        '<div class="col-sm-3 rowTitle">Summary</div>' +
        '<div class="col-sm-3 rowTitle">Performance Factor</div>' +
        '</div>';
    $('#report').append(row);

    var viewer = viewerApp.myCurrentViewer;
    /*viewer.model.search('"PLV"', function (ids) {
        viewer.isolate(ids);
        viewer.model.getBulkProperties(ids, ['Descriptor_TX', 'Volume'], function (elements) {
            console.log(elements);
        })
    }, null, /*['Descriptor_TX']);*/

    getAllLeafComponents(viewer, function (ids) {
        viewer.model.getBulkProperties(ids, ['Descriptor_TX'], function (elements) {
            elements.forEach(function (ele) {
                if (ele.properties.length > 0 && ele.properties[0].displayValue != '') {
                    var tx = ele.properties[0].displayValue;
                    if (listOfElements[tx] == null) listOfElements[tx] = [];
                    listOfElements[tx].push(ele.dbId);
                }
            })
            showResults();
        })
    })
};

function showResults() {
    descriptorsToShow.forEach(function (d) {
        if (d.properties != null) showDescriptor(d);
    })
}

function showDescriptor(value) {
    var d = value.descriptor;

    // prepare output
    var row =
        '<div class="row rowReport" id="row' + d + '">' +
        '<div class="col-sm-3 rowLabel"><span id="rowLabel' + d + '"></span></div>' +
        '<div class="col-sm-3 rowBar"><div id="bar' + d + '"></div></div>' +
        '<div class="col-sm-3 rowGauge"><div id="gauge' + d + '"></div></div>' +
        '<div class="col-sm-3 rowPerformance"><div id="performance' + d + '"></div></div>' +
        '</div>';
    $('#report').append(row);

    // sum the properties
    var viewer = viewerApp.myCurrentViewer;
    viewer.model.getBulkProperties(listOfElements[d], value.properties, function (elements) {
        var volume = 0.0;
        elements.forEach(function (ele) {
            if (ele.properties.length > 0 && ele.properties[0].displayValue != '') {
                switch (d) {
                    case 'ABH': case 'DES': case 'PLC':
                        volume += Number.parseFloat(ele.properties[0].displayValue);
                        break;
                    case 'PLV':
                        var diameter = Number.parseFloat(ele.properties[1].displayValue) / 1000; // mm to m
                        var length = Number.parseFloat(ele.properties[0].displayValue) / 1000; // mm to m
                        volume += Math.PI * Math.pow(diameter, 2) * length;
                        break;
                }
            }
        })
        $('#rowLabel' + d).html(d);// + '<br/>' + parseFloat(Math.round(volume * 100) / 100).toFixed(2));
        createBar('#bar' + d,
            [
                ['LOD100', volume * 0.6],
                ['LOD200', volume * 0.8],
                ['LOD300', volume]
            ]);
    });

    // draw chart
    createGauge('#gauge' + d, value.budget);

    // isolate on row click
    $('#row' + d).click(function () {
        viewer.isolate(listOfElements[d]);
    })
}

function createGauge(id, value) {
    var chart = c3.generate({
        bindto: id,
        data: {
            columns: [
                ['data', value]
            ],
            type: 'gauge',
        },
        gauge: {
            min: 0,
            max: 100,
            label: {
                show: false
            },
        },
        legend: {
            show: false,
        },
        tooltip: {
            show: false,
        },
        color: {
            pattern: ['#33cc33', '#ff0000'],
            threshold: {
                values: [50, 100]
            }
        },
        size: {
            height: 100
        }
    });
}

function createBar(id, values) {
    var chart = c3.generate({
        bindto: id,
        data: {
            columns: values,
            type: 'bar'
        },
        size: {
            height: 100
        },
        legend: {
            show: false,
        },
        tooltip: {
            show: false,
        },
        axis: {
            y: {
                label: {
                    text: 'Volume m3',
                    position: 'outer-middle'
                },
                tick: {
                    count: 2,
                    format: function (d) { return Math.round(d); }
                }
            },
            x: {
                label: {
                    text: 'Desing Stage',
                    position: 'outer-center'
                }
            }
        }
    });
}

function getAllLeafComponents(viewer, callback) {
    var cbCount = 0; // count pending callbacks
    var components = []; // store the results
    var tree; // the instance tree

    function getLeafComponentsRec(parent) {
        cbCount++;
        if (tree.getChildCount(parent) != 0) {
            tree.enumNodeChildren(parent, function (children) {
                getLeafComponentsRec(children);
            }, false);
        } else {
            components.push(parent);
        }
        if (--cbCount == 0) callback(components);
    }
    viewer.getObjectTree(function (objectTree) {
        tree = objectTree;
        var allLeafComponents = getLeafComponentsRec(tree.getRootId());
    });
}