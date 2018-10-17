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

  var gauge = new RGraph.Gauge({
    id: 'cvs',
    min: 0,
    max: 50,
    value: 25,
    options: {
        centery: 120,
        radius: 130,
        anglesStart: RGraph.PI,
        anglesEnd: RGraph.TWOPI,
        needleSize: 85,
        borderWidth: 0,
        shadow: false,
        needleType: 'line',
        colorsRanges: [[0,10,'red'], [10,20,'yellow'],[20,50,'#0f0']],
        borderInner: 'rgba(0,0,0,0)',
        borderOuter: 'rgba(0,0,0,0)',
        borderOutline: 'rgba(0,0,0,0)',
        centerpinColor: 'rgba(0,0,0,0)',
        centerpinRadius: 0,
        textAccessible: true
    }
}).grow()

var gauge = new RGraph.Gauge({
  id: 'cvs2',
  min: 0,
  max: 50,
  value: 40,
  options: {
      centery: 120,
      radius: 130,
      anglesStart: RGraph.PI,
      anglesEnd: RGraph.TWOPI,
      needleSize: 85,
      borderWidth: 0,
      shadow: false,
      needleType: 'line',
      colorsRanges: [[0,10,'red'], [10,20,'yellow'],[20,50,'#0f0']],
      borderInner: 'rgba(0,0,0,0)',
      borderOuter: 'rgba(0,0,0,0)',
      borderOutline: 'rgba(0,0,0,0)',
      centerpinColor: 'rgba(0,0,0,0)',
      centerpinRadius: 0,
      textAccessible: true
  }
}).grow()

gauge.canvas.onclick = function (e)
{
    var value = gauge.getValue(e);
    
    if (typeof value === 'number') {
        gauge.value = value;
        gauge.grow();
    }
}
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