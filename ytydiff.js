google.load("visualization", "1.1", {packages:["calendar","corechart","table"]});
google.setOnLoadCallback(initializeCharts);

var mbtaDatasource = 'https://docs.google.com/spreadsheets/d/1r7ImJmekQybHPB2qqynkSfixPGK8Yi1V7qgVR08sX-8/edit?usp=sharing'; // T
var taxiDatasource = 'https://docs.google.com/spreadsheets/d/1ClwPYtHIra2ChRTqf8bCxtcGd5iiqDh4t6lG81NIVWo/edit?usp=sharing' // taxi
var datasource = mbtaDatasource;

var zipcodeTableId = "11XSubKkKumVWKFnIWLq87gKPA9fY2gnbiHy_cGgR";

function useMBTASource() {
  if(datasource == taxiDatasource) {
    taxiRSParam = rsParam;
    rsParam = mbtaRSParam;
  }
  datasource = mbtaDatasource;
  $('input[name=datasource]').prop('checked', false);
  //$('#clearrs').text('Clear route/station');
}
function useTaxiSource() {
  if(datasource == mbtaDatasource) {
    mbtaRSParam = rsParam;
    rsParam = taxiRSParam;
  }
  datasource = taxiDatasource;
  $('input[name=datasource]').prop('checked', true);
  //$('#clearrs').text('Clear starting ZIP');
}
function isTaxiSource() {
  return datasource == taxiDatasource;
}

// idea: use startgeo and identify certain regions as different 'route/stations'
// idea: shuffle widgets around based on which one was last clicked.

var yty = {};
yty['2014-02-28']='2013-03-01';
yty['2014-03-01']='2013-03-02';
yty['2014-03-07']='2013-03-08';
yty['2014-03-08']='2013-03-09';
yty['2014-03-14']='2013-03-15';
yty['2014-03-15']='2013-03-16';
yty['2014-03-21']='2013-03-22';
yty['2014-03-22']='2013-03-23';
yty['2014-03-28']='2013-03-29';
yty['2014-03-29']='2013-03-30';
yty['2014-04-04']='2013-04-05';
yty['2014-04-05']='2013-04-06';
yty['2014-04-11']='2013-04-12';
yty['2014-04-12']='2013-04-13';
yty['2014-04-18']='2013-04-19';
yty['2014-04-19']='2013-04-20';
yty['2014-04-25']='2013-04-26';
yty['2014-04-26']='2013-04-27';
yty['2014-05-02']='2013-05-03';
yty['2014-05-03']='2013-05-04';
yty['2014-05-09']='2013-05-10';
yty['2014-05-10']='2013-05-11';
yty['2014-05-16']='2013-05-17';
yty['2014-05-17']='2013-05-18';
yty['2014-05-23']='2013-05-24';
yty['2014-05-24']='2013-05-25';
yty['2014-05-30']='2013-05-31';
yty['2014-05-31']='2013-06-01';
yty['2014-06-06']='2013-06-07';
yty['2014-06-07']='2013-06-08';

var dayParam = null;
var i15mParam = null;
var rsParam = [], mbtaRSParam = [], taxiRSParam = [];
var maxRouteStationSelection = 8;
var rsTable, columnChart, calendarChart, tableData;
var dayTransactions;
var zipMap;
var zipLayer=null;


var blockingCount = 0;
function blockUI() { if(blockingCount == 0) $.blockUI({message: '<span class="waitmsg">The Late Night T Data Explorer<br/>Loading...</span>'}); blockingCount++; }
function unblockUI() { blockingCount--; if(blockingCount < 1) { $.unblockUI(); blockingCount = 0; } }

function formatDay(day) {
  return moment(day).format("MMM Do YYYY");
}

function drawTable() {
  var query = new google.visualization.Query( datasource );

  var i15mWhere = "", i15mLabel = "", rsLabel = "Route/Station";
  if(isTaxiSource()) rsLabel = "Starting ZIP";
  if(i15mParam != null) {
    i15mWhere = "D = '"+i15mParam+"' ";
    if(dayParam == null) i15mWhere = "WHERE " + i15mWhere;
    else i15mWhere = "AND " + i15mWhere;

    i15mLabel = i15mParam+" ";
  }
  if(dayParam == null) {
    query.setQuery("SELECT F,sum(G),sum(H) "+ i15mWhere +" GROUP BY F ORDER BY sum(H) DESC LABEL F '"+rsLabel+"', sum(G) '2013 "+i15mLabel+"transactions', sum(H) '2014 "+i15mLabel+"transactions'");
  } else {
    var dstr = moment(dayParam).format("YYYY-MM-DD");
    var ddisplay14 = formatDay(dayParam);
    var ddisplay13 = formatDay(moment(yty[dstr]));
    query.setQuery("SELECT F,sum(G),sum(H) WHERE B = date '" + dstr + "' "+i15mWhere+" GROUP BY F ORDER BY sum(H) DESC LABEL F '"+rsLabel+"', sum(G) '"+ddisplay13+" "+i15mLabel+"transactions', sum(H) '"+ddisplay14+" "+i15mLabel+"transactions'");
  }

  blockUI();
  query.send(handleTableQueryResponse);
}

function findSelectionIndices(data, rss) {
  var sels = [];
  for(var j=0;j<rss.length;j++) {
    for(var i=0;i<data.getNumberOfRows();i++) {
      if(data.getValue(i, 0) == rss[j]) {
        sels.push({row:i});
        break;
      }
    }
  } 
  return sels;
}

function updateSummaryDiv() {
  var data = tableData;
  var sum2013 = 0, sum2014 = 0;
  for(var i=0;i<data.getNumberOfRows();i++) {
    if(rsParam.length == 0) {
      sum2013 = sum2013 + data.getValue(i, 1);
      sum2014 = sum2014 + data.getValue(i, 2);
    } else {
      for(var j=0;j<rsParam.length;j++) {
        if(data.getValue(i, 0) == rsParam[j]) {
          sum2013 = sum2013 + data.getValue(i, 1);
          sum2014 = sum2014 + data.getValue(i, 2);
          break;
        }
      }
    }
  }
  var c = (sum2014 >= sum2013 ? "5783e3" : "ff6c00");
  var sel = (rsParam.length > 0 ? "Selected" : "Total");
  $('div#summary_div').html('<span class="span-4">'+sel+' transactions:</span><strong><span class="span-2 v">'+sum2013.toLocaleString()+'</span>'+
                            '<span class="span-4 last v">'+sum2014.toLocaleString()+'</span></strong><br/>'+
                            '2014 transactions <tt>-</tt> 2013 transactions <tt>=</tt> <strong><span style="color:#'+c+'">'+(sum2014-sum2013).toLocaleString()+'</span></strong>');
}

function fixGoogleTable () {
  // $('.myTableRow td').css('background-color', 'white'); // sometimes this doesn't work
  $('.google-visualization-table-td').css('background-color','white')
  $('.mySelectedTableRow td').css('background-color', '#dadada'); // hack for broken table highlighting 
}

function handleTableQueryResponse(response) {
  unblockUI();
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }
  var data = response.getDataTable();
  var options = { allowHtml: true, page: 'enable', pageSize: 25, cssClassNames: {tableRow: 'myTableRow', oddTableRow: 'myTableRow', selectedTableRow: 'mySelectedTableRow'}, alternatingRowStyle: true };

  var table = new google.visualization.Table(document.getElementById('table_div'));
  rsTable = table;
  tableData = data;

  table.draw(data, options);

  table.setSelection(findSelectionIndices(data, rsParam));
  
  fixGoogleTable();

  updateSummaryDiv(data);

  function selectHandler() {
    var selectedItem = table.getSelection()[0];
    if(selectedItem != null && selectedItem.row != null) {
      var sels = table.getSelection();
      var rss = [];
      for(var i=0;i<sels.length;i++) {
        rss.push(data.getValue(sels[i].row, 0));
        if(i>maxRouteStationSelection-1) break;
      }
      doRouteStation(rss);
      manageStationDisplay();
      
      fixGoogleTable();
    } else {
      doRouteStation([]);
      manageStationDisplay();

      fixGoogleTable();
    }
  }
  google.visualization.events.addListener(table, 'select', selectHandler);
  google.visualization.events.addListener(table, 'page', function () {
    fixGoogleTable();
  });
}

function draw15MChart(day) {
  // yty_at_15m.tsv
  var query = new google.visualization.Query(
    datasource
    //'https://docs.google.com/spreadsheets/d/1aZDo7XbS48O9C_Lf5P7D_QsBhvEXnTOqb4ONiWYqg5Y/edit?usp=sharing'
  );

  var rsWhere = "";
  if(rsParam.length > 0) {
    rsWhere = "AND (";
    for(var i=0;i<rsParam.length;i++) {
      if(i>0) rsWhere = rsWhere + " OR ";
      rsWhere = rsWhere + "F = '"+rsParam[i]+"'";
    }
    rsWhere = rsWhere + ")";
  }

  var q = "";

  q = "SELECT D,sum(G),sum(H),min(C) WHERE 1=1 ";
  if(dayParam != null) {
    q = q + "AND B = date '" + moment(dayParam).format("YYYY-MM-DD") + "'";
  }
  if(rsParam.length > 0) {
    var disj = "AND (";
    for(var i=0;i<rsParam.length;i++) {
      if(i>0) disj = disj + " OR ";
      disj = disj + "F = '" + rsParam[i] + "'";
    }
    q = q + disj + ")";
  }
  q = q + " GROUP BY D ORDER BY min(C) LABEL sum(G) '2013', sum(H) '2014'";
  query.setQuery(q);

// old spreadsheet
//  if(dayParam == null) {
//    // have to include G in order to sort by G but it will be removed later
//    query.setQuery("SELECT D,sum(E),sum(F),G GROUP BY D,G ORDER BY G LABEL sum(E) '2013', sum(F) '2014'");
//  } else {
//    query.setQuery("SELECT D,E,F WHERE B = date '" + moment(dayParam).format("YYYY-MM-DD") + "' LABEL E '2013', F '2014'");
//  }

  

  blockUI();
  query.send(handle15MQueryResponse);
}

var data15m;

function handle15MQueryResponse(response) {
  unblockUI();
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }
  var data = response.getDataTable(), rsLabel = "route/station";
  if(isTaxiSource()) rsLabel = "starting ZIP";
  data.removeColumn(3); // min(C) is a phantom column for ordering purposes, to workaround a Google bug.
  var options = {
    title: (rsParam.length > 0 ? ' At 15m intervals for selection' : 'At 15 minute intervals'),
    hAxis: {title: 'intervals', slantedText: true},
    vAxis: {},
    colors: ['#ff6c00', '#5783e3']
  };

  if(dayParam != null) {
    var ddisplay14 = formatDay(dayParam);
    var ddisplay13 = formatDay(yty[moment(dayParam).format("YYYY-MM-DD")]);
    options['title'] = ddisplay13 + ' vs ' + ddisplay14 + ': ' + options['title'];
    if(rsParam.length == 0)
      options['vAxis']['maxValue'] = 10000; // prevent axes from moving around too much and fooling end user
    else
      options['vAxis']['maxValue'] = 1000 + (rsParam.length - 1) * 500;
  }


  var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
  columnChart = chart;
  data15m = data;
  function selectHandler() {
    var selectedItem = chart.getSelection()[0];
    if(selectedItem != null && selectedItem.row != null) {
      var x = data.getValue(selectedItem.row, 0);
      doInterval(x);
      manageTimeDisplay(x);
    } else {
      doInterval(null);
      manageTimeDisplay(null);
    }
  }
  google.visualization.events.addListener(chart, 'select', selectHandler);

  chart.draw(data, options);
}

function drawCalChart() {
  var query = new google.visualization.Query(
    datasource
    //'https://docs.google.com/spreadsheets/d/1laC-zBUpizr9lCiR-JgtNoE5p9UeBasDtPb3gzZQg28/edit?usp=sharing'
  );

  var i15mWhere = "";
  if(i15mParam != null)
    i15mWhere = "AND D = '"+i15mParam+"'";
  var rsWhere = "";
  if(rsParam.length > 0) {
    rsWhere = "AND (";
    for(var i=0;i<rsParam.length;i++) {
      if(i>0) rsWhere = rsWhere + " OR ";
      rsWhere = rsWhere + "F = '"+rsParam[i]+"'";
    }
    rsWhere = rsWhere + ")";
  }

  query.setQuery("SELECT B,sum(H) - sum(G) WHERE A <> date '2013-04-19' "+i15mWhere+" "+rsWhere+" GROUP BY B");

  query.send(handleCalQueryResponse);
  blockUI();
}

function handleCalQueryResponse(response) {
  unblockUI();
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var dataTable = response.getDataTable();

  var calchart = new google.visualization.Calendar(document.getElementById('calendar_basic'));
  calendarChart = calchart;

  function selectHandler() {
    var selectedItem = calchart.getSelection()[0];
    if (selectedItem.row != null) {
      var x = dataTable.getValue(selectedItem.row, 0);
      doDay(x);
      dayTransactions = dataTable.getValue(selectedItem.row, 1);
      manageDateDisplay(x, dayTransactions);
    }
  }
  google.visualization.events.addListener(calchart, 'select', selectHandler);
  
  var subtitle = "";
  if(i15mParam != null) subtitle = " at " + i15mParam;
  if(rsParam.length > 0) subtitle = subtitle + " for selection";
  if(subtitle.length > 0) subtitle = ":" + subtitle;
  var options = {
    title: (isTaxiSource() ? "Late Night Taxi" : "Late Night MBTA")+subtitle,
    height: 200,
  };

  calchart.draw(dataTable, options);
}

function doDay(day, noDraw) {
  dayParam = day;
  if(noDraw == true) { } else { // works even if noDraw is undefined
    draw15MChart();
    drawTable();
  }
  if(dayParam != null) $('#clearday').fadeIn();
  else {
    $('#clearday').fadeOut();
    calendarChart.setSelection();
  }
}

function doInterval(i, noDraw) {
  i15mParam = i;
  if(noDraw == true) { } else {
    drawTable();
    drawCalChart();
  }
  if(i15mParam != null) $('#clear15m').fadeIn();
  else {
    $('#clear15m').fadeOut();
    columnChart.setSelection();
  }
}

function doRouteStation(rss, noDraw) {
  rsParam = rss;
  if(noDraw == true) { } else {
    drawCalChart();
    draw15MChart();
  }
  if(rsParam.length > 0) $('#clearrs').fadeIn();
  else { 
    $('#clearrs').fadeOut();
    rsTable.setSelection();
    fixGoogleTable();
  }
}

function manageStationDisplay() {
  var stations = "", zips = "";
  if(rsParam.length > 0) {
    $('#clearrs').fadeIn();
    if(isTaxiSource())
      stations = "For starting ZIP(s): ";
    else
      stations = "For route(s)/station(s): ";

    for(var i=0;i<rsParam.length;i++) {
      if(i>0) { stations = stations + ", "; zips = zips + ", "; }
      stations = stations + rsParam[i];
      zips = zips + "'" + rsParam[i] + "'";
    }
  } else $('#clearrs').fadeOut();
  $('#station_display span').html(stations);

  updateSummaryDiv();

  if(isTaxiSource()) {
    $('#map_canvas').show();
    if (zipLayer != null) {
      zipLayer.setMap(null);
      zipLayer = null;
    }
    if(zips.length > 0) {
      zipLayer = new google.maps.FusionTablesLayer({
        query: {
          select: 'geo',
          from: zipcodeTableId,
          where: "zipcode IN ("+zips+")"
        }
      });
      zipLayer.setMap(zipMap);
    }
    var center = zipMap.getCenter(); google.maps.event.trigger(zipMap, 'resize'); zipMap.setCenter(center); // workaround google maps bug
  } else $('#map_canvas').hide();
}

function manageDateDisplay(x,v) {
  if(x != null) {
    var y = moment(x).format("YYYY-MM-DD");
    $('#date_display span').html(formatDay(yty[y]) + " compared to " + formatDay(y) // + " = " + v + " transactions difference."
                                );
  } else
    $('#date_display span').html("");
}

function manageTimeDisplay(t) {
  if(t != null)
    $('#time_display span').html("During 15 minute interval beginning at "+t);
  else
    $('#time_display span').html("");
}

function setParams(day, i15m, rss, datasource) {
  if(datasource == taxiDatasource)
    useTaxiSource();
  else
    useMBTASource();
  doDay(day, true); doInterval(i15m, true); doRouteStation(rss, true);
  drawCalChart();
  draw15MChart();
  drawTable();
  manageTimeDisplay(i15mParam);
  manageDateDisplay(dayParam, dayTransactions);
  manageStationDisplay();
  window.scrollTo(0,0);
}

function initializeCharts() {
  drawCalChart();
  draw15MChart();
  drawTable();
  $('#clearday').click(function () { doDay(null); manageDateDisplay(null, 0); });
  $('#clear15m').click(function () { doInterval(null); manageTimeDisplay(null); });
  $('#clearrs').click(function () { doRouteStation([]); manageStationDisplay(); });
  $('input[name=datasource]').change(function() {
    if($('input[name=datasource]').prop('checked'))
      useTaxiSource();
    else
      useMBTASource();
    drawCalChart();
    draw15MChart();
    drawTable();
    manageStationDisplay();
    manageTimeDisplay(i15mParam);
    manageDateDisplay(dayParam, dayTransactions);
  });

  zipMap = new google.maps.Map(document.getElementById("map_canvas"), {center: new google.maps.LatLng(42.34, -71.10), zoom: 11});
  $('#map_canvas').hide();
}
