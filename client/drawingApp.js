Session.set("selected", 'line');
points = new Meteor.Collection('pointsCollection');
var canvas;

// we use these for drawing more interesting shapes
var lastX=0;
var lastY=0;
var strokeWidth = 1;
var thickness=1;
var radius=10;
var strokeColor = "black";

Meteor.startup( function() {
  canvas = new Canvas();

  $('.swatch-clickable').each(function () {
    $(this).attr('title', $(this).attr('id'));
});
$('.swatch-clickable').tooltip();

$(".swatch-clickable").click(function() {
  $("#preview").css('background-color', $(this).css('background-color'));
  $("#color-name").html($(this).attr("id"));
  $("#color-field").val($(this).attr("id"))
});

  Deps.autorun( function() {
    var data = points.find({}).fetch();

    if (canvas) {
      canvas.draw(data);
    }
  });
});

Template.wall.events({

  "click button.js-clear": function (event) {
    Meteor.call('clear', function() {
      canvas.clear();
    });
  },

  "click a.js-line": function() {
    Session.set("selected", 'line');
  },
  
  "click a.js-circle": function() {
    Session.set("selected", 'circle');
  },

  "change li.js-size": function (event, template) {
    var size = template.find('input[name=range]'); 
    thickness = $(size).val();
    radius = $(size).val();
  },


  "change div.js-color" :function (event, template) {
    var element = template.find('input:radio[name=color]:checked');
    strokeColor = $(element).val();
  },
  
  "click a.js-export": function() {
   var canvas = document.getElementById("canvas").children[0];
    console.log(canvas);
    saveSvgAsPng(canvas, "export.png");
  },

})

var markPoint = function() {

  var offset = $('#canvas').offset();

// In the first frame, lastX and lastY are 0.
// This means the line gets drawn to the top left of the screen
// Which is annoying, so we test for this and stop it happening.

    if (lastX==0) {// check that x was something not top-left. should probably set this to -1
        lastX = (event.pageX - offset.left);
        lastY = (event.pageY - offset.top);
      }
      points.insert({
      //this draws a point exactly where you click the mouse
      // x: (event.pageX - offset.left),
      // y: (event.pageY - offset.top)});


        //We can do more interesting stuff
        //We need to input data in the right format
        //Then we can send this to d3 for drawing


        //1) Algorithmic mouse follower
      // x: (event.pageX - offset.left)+(Math.cos((event.pageX/10  ))*30),
      // y: (event.pageY - offset.top)+(Math.sin((event.pageY)/10)*30)});

        //2) draw a line - requires you to change the code in drawing.js
        x: (event.pageX - offset.left),
        y: (event.pageY - offset.top),
        x1: lastX,
        y1: lastY,
        // We could calculate the line thickness from the distance
        // between current position and last position
        // w: 0.05*(Math.sqrt(((event.pageX - offset.left)-lastX) * (event.pageX - offset.left)
        // + ((event.pageY - offset.top)-lastY) * (event.pageY - offset.top))),
        // Or we could just set the line thickness using buttons and variable
        w: thickness,
        j: radius,
        // We can also use strokeColor, defined by a selection
        c: strokeColor,
        t: Session.get("selected"),


      }); // end of points.insert()

        lastX = (event.pageX - offset.left);
        lastY = (event.pageY - offset.top);

}


Template.canvas.events({
  'click, touch': function (event) {
    markPoint();
  },
  'mousedown, touchstart': function (event) {
    Session.set('draw', true);
  },
  'mouseup, touchend': function (event) {
    Session.set('draw', false);
    lastX=0;
    lasyY=0;
  },
  'mousemove, touchmove': function (event) {
    if (Session.get('draw')) {
      markPoint();
    }
  }
});
