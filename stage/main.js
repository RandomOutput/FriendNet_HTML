var width = 500;
var height = 500;

var minX = 0;
var maxX = 1
var minY = 0;
var maxY = 1


var nodes = {};
var readyForNext = true;
var ittr = 0;
var allFriends;
var canvas;
var ctx;

var replotPointsPass1Go = true;
var replotPointsPass2Go = false;
var drawConnections = false;
var plotSteps = 0;
var plotSteps2 = 0;
var intervalGen;

var animFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  null ;

function fbLogin()
{
  logLink.removeEventListener("click", fbLogin, false);
  
  _FB.login(function(response) {
    LoggedIn();
  });
}

function LoggedIn() 
{
  document.getElementById('statusLine').innerHTML = 'Loading your friend data...';
  outLink.innerHTML = '<br />';
  //Load Friend List
  FB.api('/me','GET',{fields: 'friends'}, function(response) {
    getStarted(response)
    canvas = document.getElementById('friendNet');
    ctx = canvas.getContext('2d');
  });
}

function logOut()
{
  //alert("logOut()");
  FB.logout();
  outLink.innerHTML = '';
  //logLink.removeEventListener("click", logOut, false);
  //logLink.addEventListener("click", fbLogin, false);
}

var dataPulled = false;

function receiveMutuals(response)
{
  ctx.fillStyle = "rgba(30,30,60,1.0)";
  ctx.fillRect (0,0, width, height);
  ctx.fillStyle = "rgba(256,256,256,0.1)";
  ctx.fillRect (0,0,width,50);
  ctx.fillStyle = "rgba(256,256,256," + (ittr / allFriends.length) + ")";
  ctx.fillRect (0,0,width*(ittr / allFriends.length),50);

  if(response.mutualfriends != null)
  {
    var mutualConnections = response.mutualfriends.data;


    console.log(ittr);
    console.log("len: " + mutualConnections.length);
    console.log(mutualConnections);
    console.log("name: " + allFriends[ittr].name);
    var node2 = nodes[allFriends[ittr].name];

    for (var k=0;k<mutualConnections.length;k++)
    {
      var node1 = nodes[mutualConnections[k].name];
      
      node2.nodeConnections[node1.id] = node1;
    }
  }
  ittr = ittr + 1;

  callMutuals();
}

function getStarted(response)
{
  allFriends = response.friends.data;
  console.log(allFriends);

  //Arrange friends on grid
  for (var i=0;i<allFriends.length;i++)
  {
    var id = allFriends[i].id;
    var friendName = allFriends[i].name;
    var colCount = Math.floor(Math.sqrt(allFriends.length));
    var xPos = (0.05 * (i % colCount));
    var yPos = (0.05 * Math.floor(i / colCount));
    console.log("colCount: " + colCount);
    console.log("xPos: " + xPos);
    console.log("yPos: " + yPos);
    nodes[friendName] = new Node(xPos,yPos, id, friendName);
    checkBounds(nodes[friendName]);
  }
  
  console.log("********\n\n");
  

  callMutuals();
/*
  for (node in nodes)
  {
    console.log('Node: ' + node.id + "\n" + node.nodeConnections + "\n");
  }

  while(true)
  {
    break;
  }*/
}

function callMutuals()
{
  if(ittr < allFriends.length)
  {
    FB.api('/' + allFriends[ittr].id, {fields: 'mutualfriends'}, receiveMutuals);
  }
  else
  {
    document.getElementById('statusLine').innerHTML = 'Clumping nodes'; 
    animFrame( amimReplotter );
  }
}

function amimReplotter()
{
  if(replotPointsPass1Go == true)
  {
    if(plotSteps < 53000)
    {
      plotSteps++; 
    }
    else
    {
      replotPointsPass1Go = false;
      replotPointsPass2Go = true;
    }
  }
  replotter();
  animFrame( amimReplotter );
}

function replotter()
{

  ctx.fillStyle = "rgba(30,30,60,1.0)";
  ctx.fillRect (0,0, width, height);
  
  for(var i=0;i<allFriends.length;i++)
  { 
    node = nodes[allFriends[i].name];

    if(replotPointsPass1Go == true)
    {
      replotPointsPass1(node, ((53000.0 - plotSteps) / 53000.0));
      if(plotSteps < 53000)
      {
        plotSteps++;
        
      }
      else
      {
        replotPointsPass1Go = false;
        replotPointsPass2Go = true;
      }
    }
    else if(replotPointsPass2Go == true)
    {
      if(plotSteps2 < 2000)
      {
        plotSteps2++;
        replotPointsPass2(node, ((2000.0 - plotSteps) / 2000.0));
      }
      else
      {
        replotPointsPass2Go = false;
        drawConnections = true;
        redefineViewport();
        document.getElementById('statusLine').innerHTML = 'Graph Complete';
      }
    }
    
    if(drawConnections == true)
    {
      var nodeConn = node.nodeConnections;
      for(node2key in nodeConn)
      {
        node2 = nodeConn[node2key];
        
        //stroke(100, 100, 256, 10);
        //line(node.x, node.y, node2.x, node2.y);
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = "rgb(100,100,256)"
        ctx.beginPath();
        ctx.moveTo( normalizeWithZoom('x', node.x) * width, normalizeWithZoom('y', node.y) * height); 
        ctx.lineTo( normalizeWithZoom('x', node2.x) * width, normalizeWithZoom('y', node2.y) * height);
        ctx.stroke();
        ctx.restore();
      }
    }
    
    node.draw();
  }
}

function redefineViewport()
{
  var firstSwitch = false;
  for(var i=0;i<allFriends.length;i++)
  { 
    var hasMutuals = false;
    node = nodes[allFriends[i].name];
    var nodeConn = node.nodeConnections;

    for(conn in nodeConn)
    {
      hasMutuals = true;
      break;
    }

    if(hasMutuals)
    {
      if(!firstSwitch)
      {
        minX = node.x;
        maxX = node.x;
        minY = node.y;
        maxY = node.y;
        firstSwitch = true;
      }

      checkBounds(node);
    }
  }
}

//Normalize coordinate and apply zoom factor
function normalizeWithZoom(component, num)
{
  var retVal;
  var min; 
  var max;
  var pan;

  switch(component)
  {
    case 'x':
      min = minX;
      max = maxX;
      pan = xPan;
      break;
    case 'y':
      min = minY;
      max = maxY;
      pan = yPan;
      break;
 
  }

  retVal = ((num + (0 - min)) / (Math.abs(max - min) / zoomFactor)) - pan;


  return retVal;
}

function replotPointsPass1(node, temp)
{
  var xAverage = 0;
  var yAverage = 0;
  var xTotal = 0;
  var yTotal = 0;
  var xComp = 0;
  var yComp = 0;
  var avCount = 0.0;
  
  var nodeConn = node.nodeConnections;
      
  for(var i=0;i<allFriends.length;i++)
  {
    node2 = nodes[allFriends[i].name];

    if(node2 == node) 
    {
      continue;
    }

    var mutualNode = false;
    var xDist = node2.x - node.x;
    var yDist = node2.y - node.y;
    var dist = Math.sqrt(xDist*xDist+ yDist*yDist);

    if(nodeConn[node2.id] != null) mutualNode = true;
    /*{
      //console.log(""+node.name + " : " + nodeConn[node2.id].name + " = true")
      mutualNode = true;
    }*/

    //console.log(""+node.name + " : " + nodeConn[node2.id] + " = false")
    /*
    for(searchkey in nodeConn)
    {
      mutualNode = true;
    }*/
    
    if(mutualNode == true && dist > 0.0714)
    {
        xTotal += xDist;
        yTotal += yDist;
        avCount++;
    }
    else if(mutualNode == true && dist <= 0.057)
    {
        xTotal -= xDist*5;
        yTotal -= yDist*5;
        avCount++;
    }
    else if(mutualNode == false && dist < 0.107)
    {
        xTotal -= xDist*3;
        yTotal -= yDist*3;
        avCount++;
    } 
  }
  
  if(avCount != 0)
  {
    xAverage = xTotal / avCount;
    yAverage = yTotal / avCount;
  }
  else
  {
    return;
  }

  var avDist = Math.sqrt(xAverage*xAverage + yAverage*yAverage);
  
  if(avDist != 0)
  {
    //xComp = xAverage / 10;
    //yComp = yAverage / 10;
    xComp = xAverage / avDist;
    yComp = yAverage / avDist;
    
    node.x += xComp * (1.0 * temp);
    node.y += yComp * (1.0 * temp);
    
    if(nodeConn != {})
    {
      checkBounds(node);
    }
  }
  else
  {
    //println("no movement:" + node.name + " id:" + node.id + "\nxTotal: " + xTotal + "\nyTotal: " + yTotal + "\n" + node.nodeConnections);
  }
  
  return;
}

function replotPointsPass2(node, temp)
{
  var xAverage = 0;
  var yAverage = 0;
  var xTotal = 0;
  var yTotal = 0;
  var xComp = 0;
  var yComp = 0;
  var avCount = 0.0;

  var nodeConn = node.nodeConnections;
  
  for(var j=0;j<allFriends.length;j++)
  {
    node2 = nodes[allFriends[j].name];
    
    var xDist = node2.x - node.x;
    var yDist = node2.y - node.y;
    var dist = Math.sqrt(xDist*xDist+ yDist*yDist);
    
    if(dist < 0.004)
    {
      xTotal -= xDist;
      yTotal -= yDist;
      avCount++;
    }
  }
  
  if(avCount != 0)
  {
    xAverage = xTotal / avCount;
    yAverage = yTotal / avCount;
  }
  else
  {
    return;
  }

  var avDist = Math.sqrt(xAverage*xAverage + yAverage*yAverage);
  
  if(avDist != 0)
  {
    //xComp = xAverage / 10;
    //yComp = yAverage / 10;
    xComp = xAverage / avDist;
    yComp = yAverage / avDist;
    
    node.x += xComp * (0.003 * temp);
    node.y += yComp * (0.003 * temp);

    if(nodeConn != {})
    {
      checkBounds(node);
    }
  }
  
}

function checkBounds(node)
{
  if(node.x > maxX) maxX = node.x;
  else if(node.x < minX) minX = node.x;

  if(node.y > maxY) maxY = node.y;
  else if(node.y < minY) minY = node.y;
}


function Node(_x, _y, _id, _name)
{
  this.x = _x;
  this.y = _y;
  this.id = _id;
  this.name = _name;

  this.nodeConnections = {};

  this.draw = function()
  {
    /*
    if(this.x < 0) this.x = 0.01;
    else if(this.x > 1) this.x = 0.99;
    
    if(this.y < 0) this.y = 0.01;
    else if(this.y > 1) this.y = 0.99;
    */

    ctx.save();
    ctx.fillStyle = "rgba(120,120,200,1.0)";
    ctx.fillRect ( normalizeWithZoom('x', this.x) * width, normalizeWithZoom('y', this.y) * height, 2, 2);
    ctx.fillStyle = "rgba(220,80,80,1.0)";
    ctx.font="7px Helvetica, Arial";
    ctx.fillText(this.name,( normalizeWithZoom('x', this.x) * width)+3,( normalizeWithZoom('y', this.y) * height)+2);
    ctx.restore();
  };
}