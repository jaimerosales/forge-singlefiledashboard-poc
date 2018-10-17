/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewerApp;

$(document).ready(function () {
  launchViewer('dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c21lYy1wb2MtcmV2aXQvTklGLVNNRS1NT0QtU1QtMjQxMDAxXzE4MDgxNC5ydnQ');

  var meter = new RGraph.Meter({
    id: 'cvs',
    min: 0,
    max: 100,
    value: 75,
    options: {
        centerpinStroke: 'rgba(0,0,0,0)',
        centerpinFill: 'rgba(0,0,0,0)',
        colorsRanges: [
            [0,10,'#f20'],
            [10,20,'#f30'],
            [20,30,'#f50'],
            [30,40,'#f60'],
            [40,50,'#f80'],
            [50,60,'#fa0'],
            [60,70,'#fc0'],
            [70,80,'#fd0'],
            [80,90,'#ff0'],
            [90,100,'#ff0'],
        ],
        labelsCount: 0,
        anglesStart: RGraph.PI + 0.5,
        anglesEnd: RGraph.TWOPI - 0.5,
        linewidthSegments: 0,
        textSize: 16,
        strokestyle: 'white',
        segmentRadiusStart: 150,
        needleRadius: 210,
        border: 0,
        tickmarksSmallNum: 0,
        tickmarksBigNum: 0,
        adjustable: true
    }
}).draw()
});

function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };
  var documentId = 'urn:' + urn;
  console.log(documentId);
  // urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c21lYy1wb2MtcmV2aXQvTklGLVNNRS1NT0QtU1QtMjQxMDAxXzE4MDgxNC5ydnQ=

  Autodesk.Viewing.Initializer(options, function onInitialized() {
    viewerApp = new Autodesk.Viewing.ViewingApplication('forgeViewer');
    viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
    viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  // We could still make use of Document.getSubItemsWithProperties()
  // However, when using a ViewingApplication, we have access to the **bubble** attribute,
  // which references the root node of a graph that wraps each object from the Manifest JSON.
  var viewables = viewerApp.bubble.search({ 'type': 'geometry' });
  if (viewables.length === 0) {
    console.error('Document contains no viewables.');
    return;
  }

  // Choose any of the avialble viewables
  viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
  // item loaded, any custom action?
}

function onItemLoadFail(errorCode) {
  console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function getForgeToken(callback) {
  jQuery.ajax({
    url: '/api/forge/oauth/token',
    success: function (res) {
      callback(res.access_token, res.expires_in)
    }
  });
}