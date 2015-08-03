var mindmapModel;
var nodeDataArray = [],
    brushArray = {readonly: "grey", rmnode: "skyblue", subtree: "darkseagreen", added: "forestgreen"};

var initializeMindMap = function(panelId, archetypeModel, referenceModel, info) {
		mindmapModel = null;
		nodeDataArray = [];
		var mindmapOptions = {};
		var targetId = panelId + '_mindmap';
		mindmapOptions.archetypeModel = archetypeModel;
	  mindmapOptions.referenceModel = referenceModel;
	  $("#" + panelId + "_mindmap_container").show().append('<div id="' + panelId + '_mindmap" class="definition-mindmap"></div>');
		$("#" + panelId + "_tree").hide();
	  var openEHR = ArchetypeEditor.getRmModule('openEHR');
	  mindmapModel = new openEHR.MindmapModel(mindmapOptions);
	  var model = mindmapModel.convertToMindmap();
	
	
	
//    $.getJSON( "resources/mindmaps/mindmap_blood_pressure.json", function( data ) {
//
//        var structure = formatBuilder(data); //convert data to Go JS model structure
//
//        $("#structure-text").val(JSON.stringify(structure, null, "\t"));
//
//    });

    /* Init Go JS*/

    var goJS = go.GraphObject.make;

    var myDiagram =
        goJS(go.Diagram, (targetId || "diagram-target"),
            {
                // when the user drags a node, also move/copy/delete the whole subtree starting with that node
                "commandHandler.copiesTree": true,
                "commandHandler.deletesTree": true,
                "draggingTool.dragsTree": true,
                initialContentAlignment: go.Spot.Center,  // center the whole graph
                "undoManager.isEnabled": false,
                initialAutoScale: go.Diagram.Uniform,
//                autoScale: Diagram.UniformToFill,
                allowMove: false
            });

    myDiagram.toolManager.draggingTool.isEnabled = false;
    myDiagram.toolManager.panningTool.isEnabled = false;
    myDiagram.toolManager.dragSelectingTool.isEnabled = false;
//    myDiagram.toolManager.clickSelectingTool.isEnabled = false;
    
//    var customText = $("#customNodeEditor")[0];
//    customText.onActivate = function(a,b,c) {
//      customText.style.visibility = "";
//      var nodeData = customText.textEditingTool.textBlock.panel.panel.data;
//	  	var rmPath = nodeData.node.rmPath;
//	  	if(rmPath != undefined) {
//	  		$("#availableRmTypes").empty();
//	  		var availableOptions = mindmapModel.getValidRmTypesForConstraint(rmPath);
//	  		if(availableOptions.length > 1) {
//	        for (var i = 0; i < availableOptions.length; i++) {
//	        	$("#availableRmTypes").append("<option value='" + availableOptions[i] + "'>" + availableOptions[i] + "</option>");
//	        }
//	        $("#availableRmTypes").val(nodeData.node.rmType);
//	  		}
//	  	}
//      
//      var startingValue = customText.textEditingTool.textBlock.text;
//
//      // Finish immediately when a radio button is pressed
//      var onClick = function(e) {
//        var tool = customText.textEditingTool;
//        if (tool === null) return;
//        tool.acceptText(go.TextEditingTool.Tab);
//      }
//
//      var children = customText.children
//      var l = children.length;
//      
//      $(children["currentNodeLabel"]).val(startingValue);
//
//      // customText is a div and doesn't have a "value" field
//      // So we will make value into a function that will return
//      // the "value" of the checked radio button
//      customText.value = function() {
//        var children = customText.children;
//        return $(children["currentNodeLabel"]).val();
////        var l = children.length;
////        for (var i = 0; i < l; i++) {
////          var child = children[i];
////          if (!(child instanceof HTMLInputElement)) continue;
////          if (child.checked) {
////            return child.value;
////          }
////        }
//        return "";
//      }
//
//      // Do a few different things when a user presses a key
//      customText.addEventListener("keydown", function(e) {
//        var keynum = e.which;
//        var tool = customText.textEditingTool;
//        if (tool === null) return;
//        if (keynum == 13) { // Accept on Enter
//          tool.acceptText(go.TextEditingTool.Enter);
//          return;
//        } else if (keynum == 9) { // Accept on Tab
//          tool.acceptText(go.TextEditingTool.Tab);
//          e.preventDefault();
//          return false;
//        } else if (keynum === 27) { // Cancel on Esc
//          tool.doCancel();
//          if (tool.diagram) tool.diagram.focus();
//        }
//      }, false);
//
//      var loc = customText.textEditingTool.textBlock.getDocumentPoint(go.Spot.TopLeft);
//      var pos = myDiagram.transformDocToView(loc);
//      customText.style.left = pos.x + "px";
//      customText.style.top  = pos.y + "px";
//    }
    
    //$("body").append("<div id='customNodeEditor'><select id='availableRmTypes'><input type='text' size='20' id='currentNodeLabel'/></div>");
//    var customEditor = document.createElement("select");
//    var op;
//    var list = ["Position", "Alpha", "Beta", "Gamma", "Theta"];
//    var l = list.length;
//    for (var i = 0; i < l; i++) {
//        op = document.createElement("option");
//        op.text = list[i];
//        op.value = list[i];
//        customEditor.add(op, null);
//    }
//		var customNodeEditor =  $("#customNodeEditor")[0];
//		customNodeEditor.onActivate = function() {
//    	customNodeEditor.value = customNodeEditor.textEditingTool.textBlock.text;
//
//        // Do a few different things when a user presses a key
//    	customNodeEditor.addEventListener("keydown", function(e) {
//            var keynum = e.which;
//            var tool = customEditor.textEditingTool;
//            if (tool === null) return;
//            if (keynum == 13) { // Accept on Enter
//                tool.acceptText(go.TextEditingTool.Enter);
//                return;
//            } else if (keynum == 9) { // Accept on Tab
//                tool.acceptText(go.TextEditingTool.Tab);
//                e.preventDefault();
//                return false;
//            } else if (keynum === 27) { // Cancel on Esc
//                tool.doCancel();
//                if (tool.diagram) tool.diagram.focus();
//            }
//        }, false);
//
//        var loc = customNodeEditor.textEditingTool.textBlock.getDocumentPoint(go.Spot.TopLeft);
//        var pos = myDiagram.transformDocToView(loc);
//        customNodeEditor.style.left = pos.x+80 + "px";
//        customNodeEditor.style.top  = pos.y-5 + "px";
//    };
//
//    myDiagram.toolManager.textEditingTool.defaultTextEditor = customNodeEditor;

    /*myDiagram.nodeTemplate =
        goJS(go.Node, "Vertical",
            { selectionObjectName: "TEXT" },
            goJS(go.Picture,
                { maxSize: new go.Size(16, 16)},
                new go.Binding("source", "img")),
            goJS(go.TextBlock,
                {
                    name: "TEXT",
                    minSize: new go.Size(30, 15),
                    margin: new go.Margin(0, 0, 0, 2),
                    font: "16px SourceSansPro",
                    editable: true
                },
                // remember not only the text string but the scale and the font in the node data
                new go.Binding("text", "text").makeTwoWay(),
                new go.Binding("scale", "scale").makeTwoWay(),
                new go.Binding("font", "font").makeTwoWay()),
            goJS(go.Shape, "LineH",
                {
                    stretch: go.GraphObject.Horizontal,
                    strokeWidth: 3, height: 3,
                    // this line shape is the port -- what links connect with
                    portId: "", fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides
                },
                new go.Binding("stroke", "brush"),
                // make sure links come in from the proper direction and go out appropriately
                new go.Binding("fromSpot", "dir", function(d) { return spotConverter(d, true); }),
                new go.Binding("toSpot", "dir", function(d) { return spotConverter(d, false); })),
            // remember the locations of each node in the node data
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // make sure text "grows" in the desired direction
            new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); })
        );*/
    
    var defaultNodeAdornmentTemplate = goJS(go.Adornment, "Spot",
        // and this Adornment has a Button to the right of the selected node
        goJS(go.Panel, "Auto",         		
            // this Adornment has a rectangular blue Shape around the selected node
            goJS(go.Shape, "RoundedRectangle", { fill: null, stroke: null, strokeWidth: 2 }),
            goJS(go.Placeholder, { margin: new go.Margin(-16,6,-15,0) })
        ),
        goJS(go.Panel, "Horizontal", {
	          alignment: go.Spot.TopRight, 
	          alignmentFocus: go.Spot.BottomRight
          },
					goJS("Button", {
				 				width: 20, 
				 				height: 20,
			          "ButtonBorder.fill": "lightblue",
			          "ButtonBorder.stroke": "dodgerblue",
			          "_buttonFillOver": "rgb(0,128,255)",
			          "_buttonStrokeOver": null,
			          "_buttonStrokeNormal": "dodgerblue",
			          "_buttonFillNormal": "lightblue",
			          alignment: go.Spot.TopRight, 
			          alignmentFocus: go.Spot.BottomLeft,
			          margin: new go.Margin(0,3,0,0),
                cursor: "pointer",                 
                  click: function(e, obj) {
                  	addDefaultNodeAndLink(e, obj);
                    e.event.stopPropagation();
                    e.event.stopImmediatePropagation();
                    return false;
                	}  
            },
            goJS(go.TextBlock, " + ",  // the Button content
                { font: "bold 12pt sans-serif" }),
            new go.Binding("visible", "fixed", function(v) { return !v; })
          ),
          goJS("Button", {
		 				width: 20, 
		 				height: 20,
	          "ButtonBorder.fill": "lightblue",
	          "ButtonBorder.stroke": "dodgerblue",
	          "_buttonFillOver": "rgb(0,128,255)",
	          "_buttonStrokeOver": null,
	          "_buttonStrokeNormal": "dodgerblue",
	          "_buttonFillNormal": "lightblue",
	          alignment: go.Spot.TopRight, 
	          alignmentFocus: go.Spot.BottomLeft,
            cursor: "pointer",                 
//                click: addNodeAndLink  // define click behavior for this Button in the Adornment
              click: function(e, obj) {
              	removeNodeAndLink(e, obj);
                e.event.stopPropagation();
                e.event.stopImmediatePropagation();
                return false;
            	}  
	          },
	          goJS(go.TextBlock, " - ",  // the Button content
	              { font: "bold 12pt sans-serif" }),
	          new go.Binding("visible", "mandatory", function(v) { return !v; })
	        )
      	)
    );
    
    // define the Node template
    var simpleTemplate = goJS(go.Node, "Auto", {
				selectionAdornmentTemplate: defaultNodeAdornmentTemplate
    	},
  		goJS(go.Shape, {
      	figure: "RoundedRectangle",
//      	fill: fill ? "lightblue" : "lightgray",
//      	stroke: fill ? "darkblue" : "darkgray", 
      	strokeWidth: 1,
      	margin: new go.Margin(1,1,1,1) //new go.Margin(5, 5, 5, 5)
      }, 
      new go.Binding("fill", "mandatory", function(v) { return !v ? "lightblue" : "lightgray"; }),
      new go.Binding("stroke", "mandatory", function(v) { return !v ? "darkblue" : "darkgray"; })
      ),    
      // a table to contain the different parts of the node
      goJS(go.Panel, "Horizontal",
        { 
    			margin: new go.Margin(1,1,1,1), //new go.Margin(5, 5, 5, 5),
    			defaultAlignment: go.Spot.Left,
    			stretch: go.GraphObject.Horizontal,
    			minSize: new go.Size(30, 20)
    		},
    		goJS("TreeExpanderButton", {
          width: 14,
          "ButtonBorder.fill": "whitesmoke",
          "ButtonBorder.stroke": null,
          "_buttonFillOver": "rgba(0,128,255,0.25)",
          "_buttonStrokeOver": null
        }),    		
        // text
        goJS(go.TextBlock, {
            name: "TEXT",
            //minSize: new go.Size(30, 25),
            font: "12px SourceSansPro",
            margin: new go.Margin(0, 8, 0, 4),
            isMultiline: false
          },
          // remember not only the text string but the scale and the font in the node data
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("scale", "scale").makeTwoWay(),
          new go.Binding("font", "font").makeTwoWay(),
          new go.Binding("editable", "mandatory", function(v) { return !v; })
        )
      ),
      new go.Binding("isTreeExpanded", "expand")
//      $("TreeExpanderButton")
//      // remember the locations of each node in the node data
//      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
//      // make sure text "grows" in the desired direction
//      new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); })
    );  // end Node

    var rootTemplate = goJS(go.Node, "Auto", {selectionAdorned: false},
        goJS(go.Shape, {
        	figure: "Ellipse",
//        	fill: "lightblue",
//        	stroke: "darkblue", 
        	strokeWidth: 1,
        	margin: new go.Margin(1,1,1,1)//new go.Margin(5, 5, 5, 5)
        }, 
        new go.Binding("fill", "mandatory", function(v) { return !v ? "lightblue" : "lightgray"; }),
        new go.Binding("stroke", "mandatory", function(v) { return !v ? "darkblue" : "darkgray"; })),            
        // a table to contain the different parts of the node
        goJS(go.Panel, "Horizontal",
          { 
      			margin: new go.Margin(1,1,1,1), //new go.Margin(5, 5, 5, 5),
      			defaultAlignment: go.Spot.Left,
      			stretch: go.GraphObject.Horizontal,
      			minSize: new go.Size(10, 10),
      		},    
//      		goJS("TreeExpanderButton", {
//            width: 14,
//            "ButtonBorder.fill": "whitesmoke",
//            "ButtonBorder.stroke": null,
//            "_buttonFillOver": "rgba(0,128,255,0.25)",
//            "_buttonStrokeOver": null
//          }),      		
          // text
          goJS(go.TextBlock, {
              name: "TEXT",
              //minSize: new go.Size(30, 25),
              font: "13px SourceSansPro",
              margin: new go.Margin(0, 8, 0, 4),
              editable: false
            },
            // remember not only the text string but the scale and the font in the node data
            new go.Binding("text", "text").makeTwoWay(),
            new go.Binding("scale", "scale").makeTwoWay(),
            new go.Binding("font", "font").makeTwoWay()
          )
        )
//        $("TreeExpanderButton")
//        // remember the locations of each node in the node data
//        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
//        // make sure text "grows" in the desired direction
//        new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); })
      );  // end Node    
    
    var rmNodeTemplate = goJS(go.Node, "Auto",  {
				selectionAdornmentTemplate: defaultNodeAdornmentTemplate,
				cursor: "pointer"
  		},
    		goJS(go.Shape, {
        	figure: "RoundedRectangle",
//        	fill: "lightblue",
//        	stroke: "darkblue", 
        	strokeWidth: 1,
        	margin: new go.Margin(1,1,1,1) //new go.Margin(5, 5, 5, 5)
        }, 
        new go.Binding("fill", "mandatory", function(v) { return !v ? "lightblue" : "lightgray"; }),
        new go.Binding("stroke", "mandatory", function(v) { return !v ? "darkblue" : "darkgray"; })),     		
//      goJS(go.Shape, {
//      	figure: "RoundedRectangle",
//      	fill: "lightblue",
//      	stroke: "darkblue", 
//      	strokeWidth: 1,
//      	margin: new go.Margin(5, 6, 5, 6)
//      }),            
      // a table to contain the different parts of the node
      goJS(go.Panel, "Horizontal",
        { 
    			margin: new go.Margin(1,1,1,1), //new go.Margin(5, 5, 5, 5),
    			defaultAlignment: go.Spot.Left,
    			stretch: go.GraphObject.Horizontal,
    			minSize: new go.Size(30, 15),
    			click: function(e, obj) {
    				var rmPath = obj.part.data.node.rmPath;
    				if(rmPath != undefined) {
	            var fullObject = mindmapModel.getConstraintObject(rmPath);
	            var current = {
	                mindmapNode: obj.part.data,
	                data: fullObject
	            };
	            var constraintData = {
	                info: info,
	                cons: fullObject
	            };
	            constraintData.specializeCallback = function () {
	                //specializeConstraint(archetypeModel, constraintData, treeEvent.node);
	            };
	            constraintData.saveCallback = function() {
	            	var nodeData = mindmapModel.getConstraintObject(rmPath);
	            	repaintMindMapNode(obj, current);
	                //info.tree.styleNodes(treeEvent.node.id);
	            };
	            info.propertiesPanel.show(constraintData);   
    				} else {
    					info.propertiesPanel.clear();
    				}
    			}
    		},
    		goJS("TreeExpanderButton", {
          width: 14,
          "ButtonBorder.fill": "whitesmoke",
          "ButtonBorder.stroke": null,
          "_buttonFillOver": "rgba(0,128,255,0.25)",
          "_buttonStrokeOver": null
        }),    		
        // icon
        goJS(go.Picture, {
        	name: "ICON",
      		desiredSize: new go.Size(15, 15),
      		margin: new go.Margin(2, 2, 2, 5),
          imageStretch: go.GraphObject.Uniform,
          alignment: go.Spot.TopRight,
          cursor: "pointer",
          click: function(e, obj) {
            var loc = obj.getDocumentPoint(go.Spot.BottomLeft);
            var pos = myDiagram.transformDocToView(loc);
          	var rmPath = obj.part.data.node.rmPath;
          	var panelPosition = $(myDiagram.div).offset();
          	if(rmPath != undefined) {
          		var availableOptions = mindmapModel.getValidRmTypesForConstraint(rmPath);
          		if(availableOptions.length > 1) {
            		$("body").append("<div id='customNodeEditor' style='width:100px;xdisplay:none;position:relative;z-index:1000;'><select id='availableRmTypes'></div>");
            		$("#customNodeEditor").offset({left: panelPosition.left + pos.x, top: panelPosition.top + pos.y});
                for (var i = 0; i < availableOptions.length; i++) {
                	$("#availableRmTypes").append("<option value='" + availableOptions[i] + "'>" + availableOptions[i] + "</option>");
                }
                $("#availableRmTypes").val(obj.part.data.node.rmType);
                $("#availableRmTypes").change(obj.part, function(ev) {
                	changeNodeRmType(ev.data, $(this).val());
                	$(this).parent().remove();
                });
          		}       		
          	}
//          	$("#customNodeEditor").css("display","block");
//          	$("#customNodeEditor").offset({left: pos.x, top: pos.y});
            e.event.stopPropagation();
            e.event.stopImmediatePropagation();
            return false;
          }
        }, new go.Binding("source", "img", function(v,f,g,h) { 
        	return v;
        })),
        // text
        goJS(go.TextBlock, {
            name: "TEXT",
            //minSize: new go.Size(30, 25),
            font: "12px SourceSansPro",
            margin: new go.Margin(0, 8, 0, 4),
            isMultiline: false
//            textEditor: customText
          },
          // remember not only the text string but the scale and the font in the node data
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("scale", "scale").makeTwoWay(),
          new go.Binding("font", "font").makeTwoWay(),
          new go.Binding("editable", "mandatory", function(v) { return !v; })
        )
//        {
//	        contextMenu: goJS(go.Adornment, "Vertical",  // that has one button
//	        		goJS("ContextMenuButton",
//	        			goJS(go.TextBlock, "Change Color"),
//	              	{ }
//	        		)
//	            // more ContextMenuButtons would go here
//	          )  // end Adornment
//	      }        
      ),  // end Table Panel
      // remember the locations of each node in the node data
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // make sure text "grows" in the desired direction
      new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); }),
      new go.Binding("isTreeExpanded", "expand")
    );  // end Node    
    
    // create the nodeTemplateMap, holding three node templates:
    var templmap = new go.Map("string", go.Node);
    // for each of the node categories, specify which template to use
    templmap.add("simple", simpleTemplate);
    templmap.add("root", rootTemplate);
    templmap.add("rmNode", rmNodeTemplate);
    // for the default category, "", use the same template that Diagrams use by default;
    // this just shows the key value as a simple TextBlock
    templmap.add("", myDiagram.nodeTemplate);
    myDiagram.nodeTemplateMap = templmap;
    
    // selected nodes show a button for adding children
//    myDiagram.nodeTemplate.selectionAdornmentTemplate =
//        goJS(go.Adornment, "Spot",
//            goJS(go.Panel, "Auto",
//                // this Adornment has a rectangular blue Shape around the selected node
//                goJS(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 2 }),
//                goJS(go.Placeholder, { margin: new go.Margin(2, 2, 0, 2) })
//            ),
//            // and this Adornment has a Button to the right of the selected node
//            goJS(go.Shape,
//                {
//                    alignment: go.Spot.Right,
//                    alignmentFocus: go.Spot.Left,
//                    click: addNodeAndLink  // define click behavior for this Button in the Adornment
//                }
////                goJS(go.TextBlock, " + ",  // the Button content
////                    { font: "bold 8pt sans-serif" })
//            )
//        );

    // the context menu allows users to change the font size and weight,
    // and to perform a limited tree layout starting at that node
//    myDiagram.nodeTemplate.contextMenu =
//        goJS(go.Adornment, "Vertical",
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Bigger"),
//                { click: function(e, obj) { changeTextSize(obj, 1.1); } }),
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Smaller"),
//                { click: function(e, obj) { changeTextSize(obj, 1/1.1); } }),
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Bold/Normal"),
//                { click: function(e, obj) { toggleTextWeight(obj); } }),
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Layout"),
//                {
//                    click: function(e, obj) {
//                        var adorn = obj.part;
//                        adorn.diagram.startTransaction("Subtree Layout");
//                        layoutTree(myDiagram, adorn.adornedPart);
//                        adorn.diagram.commitTransaction("Subtree Layout");
//                    }
//                }
//            )
//        );

    // a link is just a Bezier-curved line of the same color as the node to which it is connected
    myDiagram.linkTemplate =  goJS(go.Link,
      {
        curve: go.Link.Bezier,
        fromShortLength: -1,
        toShortLength: -1,
        selectable: false
      },
      goJS(go.Shape,
        { strokeWidth: 2 },
        new go.Binding("stroke", "toNode", function(n) { return n.data.brush; }).ofObject())
    );

//    // the Diagram's context menu just displays commands for general functionality
//    myDiagram.contextMenu =
//        goJS(go.Adornment, "Vertical",
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Undo"),
//                { click: function(e, obj) { e.diagram.commandHandler.undo(); } },
//                new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canUndo(); }).ofObject()),
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Redo"),
//                { click: function(e, obj) { e.diagram.commandHandler.redo(); } },
//                new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canRedo(); }).ofObject()),
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Save"),
//                { click: function(e, obj) { save(); } }),
//            goJS("ContextMenuButton",
//                goJS(go.TextBlock, "Load"),
//                { click: function(e, obj) { load(); } })
//        );

//    myDiagram.addDiagramListener("SelectionMoved", function(e) {
//        var rootX = myDiagram.findNodeForKey(0).location.x;
//        myDiagram.selection.each(function(node) {
//            if (node.data.parent !== 0) return; // Only consider nodes connected to the root
//            var nodeX = node.location.x;
//            if (rootX < nodeX && node.data.dir !== "right") {
//                node.data.dir = 'right';
//                myDiagram.model.updateTargetBindings(node.data);
//                layoutTree(myDiagram, node);
//            } else if (rootX > nodeX && node.data.dir !== "left") {
//                node.data.dir = 'left';
//                myDiagram.model.updateTargetBindings(node.data);
//                layoutTree(myDiagram, node);
//            }
//        });
//    });
    myDiagram.addDiagramListener("ChangedSelection", function(e) {
    	$("#customNodeEditor").remove();
    });


    myDiagram.addDiagramListener("TreeExpanded",
    	function(e) {
    		layoutAll(e.diagram);
      });

    myDiagram.addDiagramListener("TreeCollapsed",
      	function(e) {
      		layoutAll(e.diagram);
        });
    
    myDiagram.addDiagramListener("BackgroundSingleClicked",
      	function(e) {
    			info.propertiesPanel.clear();
        });
    

    /* Actions */
  $("#getMindmapModel").on("click touchstart", function() { // "Generate" button
      console.log(myDiagram.model.toJson());
  });
  
  myDiagram.model = go.Model.fromJson(formatBuilder(model));
  arrangeLayout(myDiagram);
  
  
	//return myDiagram;
}


function repaintMindMapNode(obj, nodeData) {
	obj.diagram.startTransaction("Repaint node");
	changeNodeLabel(obj, nodeData.data.node.rmType);
	changeNodeRmType(obj, nodeData.data.node.text);
	obj.diagram.commitTransaction("Repaint node");
}

function formatBuilder(data){
  var key = 0;
  if (data) {
  	var nodeData = $.extend({}, data);
  	delete nodeData.children;
    nodeDataArray.push( {"key": key, "text": data.label , "loc":"0 0", "category": "root", "node": nodeData, "mandatory": true} );
    if (data.children){
        recursiveChildrenFormatBuilder(data.children, key);
    }
  }
  return { "class": "go.TreeModel", "nodeDataArray": nodeDataArray };
}

function recursiveChildrenFormatBuilder(data, parentKey, brush, dir) {
  for (var i=0; i<data.length; i++){
      var key = "";
      // [{readonly: "grey"}, {rmnode: "skyblue"}, {subtree: "darkseagreen"}];
      var brush = brushArray["rmnode"];
      if (data[i].children && !data[i].rmType) {
      	brush = brushArray["subtree"];
      }
      if(parentKey == 0){
          key = (i + 1);
          brush = brush;  // random brush color
          dir = (dir == "left") ? "right" : "left";  // left/right alternate for first level children
      }
      else {
          key = parentKey + "" + (i + 1);
      }
    	var nodeData = $.extend({}, data[i]);
    	delete nodeData.children;
      var nodeObj = {"key": parseInt(key), "parent": parentKey, "text": data[i].label, "brush": brush, "dir": dir, "node": nodeData, "expand": (data[i].section != "description" && data[i].section != "attribution")};

      if (data[i].rmType) {
          nodeObj["img"] = "mindmap/resources/icons/" + data[i].rmType.toLowerCase() + ".png";
          nodeObj["category"] = "rmNode";
      } else {
      	nodeObj["category"] = "simple";
      }
//      if((data[i].hasOwnProperty("canAddChildren") && data[i].canAddChildren) || (data[i].hasOwnProperty("canDelete") && data[i].canDelete)) {
      if(data[i].hasOwnProperty("canDelete") && data[i].canDelete) {
      	nodeObj["mandatory"] = false;
      } else {
      	nodeObj["mandatory"] = true;
      }
      if(data[i].hasOwnProperty("canAddChildren") && data[i].canAddChildren) {
      	nodeObj["fixed"] = false;
      } else {
      	nodeObj["fixed"] = true;
      }
      nodeDataArray.push(nodeObj);

      if (data[i].children){
          recursiveChildrenFormatBuilder(data[i].children , key, brush, dir);
      }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spotConverter(dir, from) {
  if (dir === "left") {
      return (from ? go.Spot.Left : go.Spot.Right);
  } else {
      return (from ? go.Spot.Right : go.Spot.Left);
  }
}

function changeTextSize(obj, factor) {
  var adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Size");
  var node = adorn.adornedPart;
  var tb = node.findObject("TEXT");
  tb.scale *= factor;
  adorn.diagram.commitTransaction("Change Text Size");
}

function changeNodeRmType(obj, rmType) {
	rmType = rmType || obj.data.node.rmType;
	obj.diagram.startTransaction("Change RmType");
  obj.setProperties({
    "ICON.source": "mindmap/resources/icons/" + (obj ? rmType.toLowerCase() : "DV_TEXT".toLowerCase()) + ".png"
	});
  obj.data.node.rmType = rmType;
  obj.diagram.commitTransaction("Change RmType");
}

function changeNodeLabel(obj) {
	obj.diagram.startTransaction("Change Label");
  obj.setProperties({
    "TEXT.text": obj.data.node.label
	});
  obj.diagram.commitTransaction("Change Label");
}

function toggleTextWeight(obj) {
  var adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Weight");
  var node = adorn.adornedPart;
  var tb = node.findObject("TEXT");
  // assume "bold" is at the start of the font specifier
  var idx = tb.font.indexOf("bold");
  if (idx < 0) {
      tb.font = "bold " + tb.font;
  } else {
      tb.font = tb.font.substr(idx + 5);
  }
  adorn.diagram.commitTransaction("Change Text Weight");
}

function addDefaultNodeAndLink(e, obj) {
  var adorn = obj.part;
  var diagram = adorn.diagram;
  diagram.startTransaction("Add Node");
  var oldnode = adorn.adornedPart;
  var olddata = oldnode.data;
  var rmPath = olddata.node.rmPath;
//  var validRmTypes = ["DV_TEXT"];
  var newNode = null;
  if(rmPath != undefined) {
//  	validRmTypes = mindmapModel.getValidRmTypesForConstraint(rmPath);
    newNode = mindmapModel.createConstraintChild(rmPath);
  }
  // copy the brush and direction to the new node data
  var label = "New " + (newNode.rmType ? newNode.rmType.substring("DV_".length) : "TEXT").toLowerCase();
  var newdata = { 
  		text: label, 
  		brush: brushArray["added"], 
  		dir: olddata.dir, 
  		parent: olddata.key, 
  		mandatory: false, 
  		fixed: true, 
  		category: "rmNode", 
  		img: "mindmap/resources/icons/" + (newNode ? newNode.rmType.toLowerCase() : "DV_TEXT".toLowerCase()) + ".png",
  		node: {
  			label: label,
  			rmPath: newNode.rmPath,
  			rmType: newNode.rmType
  		}
  };
  diagram.model.addNodeData(newdata);
  layoutTree(diagram, oldnode);
  diagram.commitTransaction("Add Node");
  layoutAll(diagram);
}

function removeNodeAndLink(e, obj) {
  var adorn = obj.part;
  var diagram = adorn.diagram;
  diagram.startTransaction("Remove Node");
  var oldnode = adorn.adornedPart;
  var olddata = oldnode.data;
  deleteNode(diagram, oldnode);
  layoutTree(diagram, oldnode);
  diagram.commitTransaction("Remove Node");
  layoutAll(diagram);
}

function deleteNode(mydiagram, deletedItem)
{
    var nodeToDelete = mydiagram.selection.iterator.first();    
    var childNodes = getChildNodes(mydiagram, deletedItem);
    $.each(childNodes, function()
    {
         myDiagram.remove(this);
    });
    mydiagram.commandHandler.deleteSelection();
}

function getChildNodes(mydiagram, deleteNode)
{
    var children = [];
    var allConnected= deleteNode.findNodesConnected();
    while (allConnected.next())
    {
        var child = allConnected.value;
        if (isChildNode(mydiagram, deleteNode, child))
        {
            children.push(child);
            var subChildren = getChildrenNodes(child);
            $.each(subChildren, function()
            {
                children.push(this);
            });
       }
   }
   return children;
}

function isChildNode(mydiagram, currNode, currChild)
{
    var links = mydiagram.links.iterator;
    while (links.next())
    {
        var currentLinkModel = links.value.data;
        if (currentLinkModel.from === currNode.data.key &&   currentLinkModel.to === currChild.data.key)
        {
             return true;
        }
    }
    return false;
}

function layoutAll(myDiagram) {
  var root = myDiagram.findNodeForKey(0);
  if (root === null) return;
  myDiagram.startTransaction("Layout");
  // split the nodes and links into two collections
  var rightward = new go.Set(go.Part);
  var leftward = new go.Set(go.Part);
  root.findLinksConnected().each(function(link) {
      var child = link.toNode;
      if (child.data.dir === "left") {
          leftward.add(root);  // the root node is in both collections
          leftward.add(link);
          leftward.addAll(child.findTreeParts());
      } else {
          rightward.add(root);  // the root node is in both collections
          rightward.add(link);
          rightward.addAll(child.findTreeParts());
      }
  });
  // do one layout and then the other without moving the shared root node
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  myDiagram.commitTransaction("Layout");
}

function layoutTree(myDiagram, node) {
  if (node.data.key === 0) {  // adding to the root?
      layoutAll(myDiagram);  // lay out everything
  } else {  // otherwise lay out only the subtree starting at this parent node
      var parts = node.findTreeParts();
      layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
  }
}

function layoutAngle(parts, angle) {
  var layout = go.GraphObject.make(go.TreeLayout,
      { angle: angle,
          arrangement: go.TreeLayout.ArrangementFixedRoots,
          nodeSpacing: 5,
          layerSpacing: 20 });
  layout.doLayout(parts);
}

$( window ).resize(function() {

  //var div = myDiagram.div;
  //div.style.width = '500px';
  //myDiagram.requestUpdate(); // Needed!
});

function arrangeLayout (myDiagram) {
  var root = myDiagram.findNodeForKey(0);
  if (root === null) return;
  myDiagram.startTransaction("Layout");
  // split the nodes and links into two collections
  var rightward = new go.Set(go.Part);
  var leftward = new go.Set(go.Part);
  root.findLinksConnected().each(function(link) {
      var child = link.toNode;
      if (child.data.dir === "left") {
          leftward.add(root);  // the root node is in both collections
          leftward.add(link);
          leftward.addAll(child.findTreeParts());
      } else {
          rightward.add(root);  // the root node is in both collections
          rightward.add(link);
          rightward.addAll(child.findTreeParts());
      }
  });
  // do one layout and then the other without moving the shared root node
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  myDiagram.commitTransaction("Layout");

  //console.log( myDiagram.model.toJson() );
}
