LogicOperator = React.createClass({displayName: "LogicOperator",
	changeOperator: function(op) {
		this.props.updateGroupOperator(op);
	},
	render: function() {
		var andClass = "btn btn-primary",
			orClass = "btn btn-primary";
		if(this.props.logicOperator === 0) {
			andClass += " active";
		} else {
			orClass += " active";
		}
		return (
			React.createElement("div", {className: "btn-group", role: "group"}, 
		  		React.createElement("button", {type: "button", className: andClass, onClick: this.changeOperator.bind(this, 0)}, "And"), 
		  		React.createElement("button", {type: "button", className: orClass, onClick: this.changeOperator.bind(this, 1)}, "Or")
			)
		);
	}
});

FilterRule = React.createClass({displayName: "FilterRule",
	getInitialState: function() {
		return {
			operators: {
				"enum" : {
					"equal" : "=",
					"notEqual" : "!="
				}
			}
		}
	},
	selectInstrument: function(event){
		var rule = this.props.rule,
			that = this;
		if(event.target.value){
			rule.instrument = event.target.value;
			$.get("AjaxHelper.php?Module=dataquery&script=datadictionary.php", { category: rule.instrument}, function(data) {
                rule.fields = data;
                that.props.updateRule(that.props.index, rule);
            }, 'json');
		}
	},
	fieldSelect: function() {
		var rule = this.props.rule;
		delete rule.field;
		delete rule.fieldType;
		delete rule.operator;
		delete rule.value;
		if(event.target.value) {
			rule.field = rule.fields[event.target.value].key[1];
			rule.fieldType = rule.fields[event.target.value].value.Type;
		}
		this.props.updateRule(that.props.index, rule);
	},
	operatorSelect: function() {
		var rule = this.props.rule;
		delete rule.operator;
		delete rule.value;
		if(event.target.value) {
			rule.operator = event.target.value;
		}
		this.props.updateRule(that.props.index, rule);
	},
	valueSet: function() {
		var rule = this.props.rule,
			that = this;
		delete rule.value;
		if(event.target.value) {
			var responseHandler = function(data) {
		            rule.session = data;
		            that.props.updateSessions(rule);
		        },
				ajaxRetrieve = function(script) {
		            $.get("AjaxHelper.php?Module=dataquery&script=" + script,
		                  {
		                    category: rule.instrument,
		                    field: rule.field,
		                    value: event.target.value
		                  },
		                  responseHandler,
		                  'json'
		            );
		        };
		    switch(rule.operator) {
		    	case "equal":
		    		ajaxRetrieve("queryEqual.php");
		    		break;
		    	case "notEqual":
		    		ajaxRetrieve("queryNotEqual.php");
		    		break;
		    	default:
		    		break;
		    }
			rule.value = event.target.value;
		}
		this.props.updateRule(that.props.index, rule);
	},
	render: function() {
		var rule;
		if(this.props.rule.instrument) {
			var fields = this.props.rule.fields.map(function(field, index){
					return (
						React.createElement("option", {value: index}, field.key[1])
					);
				}),
				operators = [],
				inputOptions, input, operatorKey, operatorSelect, options, value;
			if(this.props.rule.fieldType) {
				inputType = this.props.rule.fieldType.split("(");
				operatorKey = inputType[0]
				for(var key in this.state.operators[operatorKey]){
					operators.push(
						React.createElement("option", {value: key, onChange: this.operatorSelect}, 
							this.state.operators[operatorKey][key]
						)
					);
				}
				value = (this.props.rule.operator) ? this.props.rule.operator : "";
				operatorSelect = (
					React.createElement("select", {className: "input-sm col-xs-4", onChange: this.operatorSelect, value: value}, 
						React.createElement("option", {value: ""}), 
						operators
					)
				);
				if(this.props.rule.operator){
					switch(operatorKey){
						case "enum":
							inputOptions = enumToArray(this.props.rule.fieldType);
							options = inputOptions.map(function(option){
								return (
									React.createElement("option", {value: option}, 
										option
									)
								);
							});
							value = (this.props.rule.value) ? this.props.rule.value : "";
							input = (
								React.createElement("select", {className: "input-sm col-xs-4", onChange: this.valueSet, value: value}, 
									React.createElement("option", {value: ""}), 
									options
								)
							);
						default:
							break;
					}
				}
			}
			rule = (
				React.createElement("div", null, 
					React.createElement("div", {className: "col-xs-12"}, 
						React.createElement("label", {className: "instrumentLabel"}, this.props.rule.instrument)
					), 
					React.createElement("div", {className: "col-xs-10"}, 
						React.createElement("select", {className: "input-sm col-xs-4", onChange: this.fieldSelect}, 
							React.createElement("option", {value: ""}), 
							fields
						), 
						operatorSelect, 
						input
					)
				)
			);
		} else {
			var options = this.props.items.map(function(item){
				return (
					React.createElement("option", {value: item.category}, item.category)
				);
			});
			rule = (
				React.createElement("select", {onChange: this.selectInstrument, className: "input-sm col-xs-10"}, 
					React.createElement("option", {value: ""}), 
					options
				)
			)
		}
		return (
			React.createElement("div", {className: "panel panel-default"}, 
				React.createElement("div", {className: "panel-body"}, 
					rule, 
					React.createElement("div", {className: "col-xs-2"}, 
						React.createElement("button", {className: "btn btn-danger btn-sm pull-right", 
								onClick: this.props.deleteRule.bind(this, this.props.index)
						}, 
							React.createElement("span", {className: "glyphicon glyphicon-remove"}), " Delete"
						)
					)
				)
			)
		);
	}
});

FilterGroup = React.createClass({displayName: "FilterGroup",
	updateChild: function(index, child) {
		var group = this.props.group;
		group.children[index] = child;
		if(this.props.index) {
			this.props.updateGroup(this.props.index, group);
		} else {
			this.props.updateFilter(group);
		}
	},
	updateGroupOperator: function(operator) {
		var group = this.props.group;
		group.activeOperator = operator;
		if(this.props.index) {
			this.props.updateGroup(this.props.index, group);
		} else {
			this.props.updateFilter(group);
		}
	},
	updateSessions: function(index, child) {
		var group = this.props.group,
		 	sessions = [],
		 	session = [];
		group.children[index] = child;
		group.session = getSessions(group);
		if(this.props.index) {
			this.props.updateSessions(this.props.index, group);
		} else {
			this.props.updateFilter(group)
		}
	},
	addChild: function(type) {
		var child,
			group = this.props.group;
		if(type === "rule") {
			child = {
				type: "rule"
			}
		} else {
			child = {
				type: "group",
				activeOperator: 0,
				children: [
					{
						type: "rule"
					}
				]
			}
		}
		group.children.push(child);
		if(this.props.index) {
			this.props.updateGroup(this.props.index, group);
		} else {
			this.props.updateFilter(group)
		}
	},
	deleteChild: function(index) {
		var group = this.props.group;
		group.children.splice(index, 1);
		group.session = getSessions(group);
		if(this.props.index) {
			this.props.updateGroup(this.props.index, group);
		} else {
			this.props.updateFilter(group);
		}
	},
	render: function() {
		var logicOperator = (
				React.createElement(LogicOperator, {logicOperator: this.props.group.activeOperator, 
							   updateGroupOperator: this.updateGroupOperator}
				)
			),
			that = this,
		    children = this.props.group.children.map(function(child, index){
		    	if(child.type === "rule") {
		    		return (
		    			React.createElement("li", null, 
		    				React.createElement(FilterRule, {rule: child, 
		    							items: that.props.items, 
		    							index: index, 
		    							updateRule: that.updateChild, 
		    							updateSessions: that.updateSessions, 
		    							deleteRule: that.deleteChild}
		    				)
		    			)
		    		);
		    	} else if(child.type === "group") {
		    		return (
		    			React.createElement("li", null, 
		    				React.createElement(FilterGroup, {group: child, 
		    							 items: that.props.items, 
		    							 index: index, 
		    							 updateGroup: that.updateChild, 
		    							 updateSessions: that.updateSessions, 
		    							 deleteGroup: that.deleteChild}
		    				)
		    			)
		    		);
		    	}
		    }),
			deleteButton;
		if(this.props.deleteGroup){
			deleteButton = (
				React.createElement("button", {className: "btn btn-danger btn-sm pull-right", 
										onClick: this.props.deleteGroup.bind(this, this.props.index)
				}, 
					React.createElement("span", {className: "glyphicon glyphicon-remove"}), " Add Rule"
				)
			)
		}
		return (
			React.createElement("div", {className: "tree"}, 
				React.createElement("ul", {className: "firstUL"}, 
					React.createElement("li", null, 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-2"}, 
								logicOperator
							), 
							React.createElement("div", {className: "col-xs-10"}, 
								deleteButton, 
								React.createElement("button", {className: "btn btn-primary btn-sm pull-right", 
										onClick: this.addChild.bind(this, "group")
								}, 
									React.createElement("span", {className: "glyphicon glyphicon-add"}), " Add Group"
								), 
								React.createElement("button", {className: "btn btn-primary btn-sm pull-right", 
										onClick: this.addChild.bind(this, "rule")
								}, 
									React.createElement("span", {className: "glyphicon glyphicon-add"}), " Add Rule"
								)
							)
						), 
						React.createElement("ul", null, 
							children
						)
					)
				)
			)
		)
	}
});

FilterBuilder = React.createClass({displayName: "FilterBuilder",
	getInitialState: function() {
		return {
			filter: {
				type: "group",
				activeOperator: 0,
				children: [
					{
						type: "rule"
					}
				]
			}
		}
	},
	updateFilter: function(filter) {
		this.setState({
			filter: filter
		});
	},
    render: function() {
        return (
        	React.createElement("div", null, 
        		React.createElement("h1", {className: "col-xs-12"}, "Filter"), 
        		React.createElement("div", {className: "col-xs-12"}, 
	        		React.createElement("div", {className: "well well-primary"}, 
	        			React.createElement(FilterGroup, {group: this.state.filter, 
	        						 items: this.props.items, 
	        						 updateFilter: this.updateFilter}
	        			)
					)
				)
        	)
        );
    }
});