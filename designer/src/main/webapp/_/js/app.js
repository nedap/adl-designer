angular.module('ArchetypeEditor', ['angularModalService','RecursionHelper'])

	.config(function () {

	})
	.controller('MainCtrl', function MainCtrl(ModalService) {
		var main = this;
		this.tab = 'definition';

		var archetypeRepo = AOM.ArchetypeRepository()

		this.setTab = function (tab) {
			main.tab = tab;
		}

		main.dataForTheTree = [];

		this.load = function () {
			ModalService.showModal({
				templateUrl: "templates/modal.html",
				controller: "ModalController as modal"
			}).then(function(modal) {
				modal.element[0].style.display = 'block';
				modal.element[0].classList.add('in');
				modal.close.then(function(result) {
					main.dataForTheTree = [result];
				});
			});
		}

		this.expCol = function (data,e) {
			var exp = data.exp = !data.exp;

			if(e.metaKey){
				(function climb(data){
					data.forEach(function (d) {
						d.exp = exp;
						if(d.children) climb(d.children);
					});
				})(data.children);
			}
		}

		this.form = function (node) {
			console.log('load form', node);
			main.selectedType = node.rm_type_name;
			console.log(main.selectedTypeTemplate);
			console.log(1);
		}


		this.selectedTemplate = function () {
			console.log(2);
			return main.selectedType ? 'templates/primitive/'+ main.selectedType.toLowerCase() + '.html' : null;
		}

	}).controller('ModalController', function(close,ArchetypeService) {
		var modal = this;

		ArchetypeService.list().then(function (data) {
			modal.selected = 'openEHR-EHR-OBSERVATION.demo.v1.0.0' || data.infoList[0].archetypeId;
			modal.options = data.infoList;
		});

		modal.close = function () {
			close();
		}

		modal.loadArchetype = function () {
			ArchetypeService.loadArchetype(modal.selected, function (data) {

				var count =0;

				function climb (node) {
					var nn = angular.copy(node);
					delete nn.attributes
					delete nn.children

					var n = { name: '', node: nn };

					if(node.node_id) {
						n.name = (node.node_id ? data.getTermDefinitionText(node.node_id) : '') || node.rm_type_name;
					} else  {
						n.name = node.rm_type_name;

						if(!n.name){
							n.name = node.rm_attribute_name;
						}
					}

					n.rm_type_name = node.rm_type_name;

					if(node.attributes && node.attributes[0] && node.attributes.length) {
						n.children = [];
						node.attributes.forEach(function (c) {
							n.children.push(climb(c));
						});
						return n;
					}

					if(node.children && node.children.length) {
						n.children = [];
						node.children.forEach(function (c) {
							n.children.push(climb(c));
						})
					}

					return n;
				}

				var newTree = climb(data.data.definition);

				//console.log('new tree',JSON.stringify(newTree,null, "\t"));

				close(newTree);
			});

		}
	})
	.service('ArchetypeService', function ($q,$http) {

		this.list = function () {
			var deferred = $q.defer();
			AOM.ArchetypeRepository(function (data) {
				deferred.resolve(data)
			});
			return deferred.promise;
		}

		this.loadArchetype = function (archetypeId,callback) {
			$http.get("/rest/repo/archetype/" + encodeURIComponent(archetypeId) + "/flat").success(function (data) {
				if (data.parent_archetype_id) {
					$http.get("/rest/repo/archetype/" + encodeURIComponent(data.parent_archetype_id.value) + "/flat").success(
						function (parentData) {
							var parentArchetypeModel = new AOM.ArchetypeModel(parentData);
							var archetypeModel = new AOM.ArchetypeModel(data, parentArchetypeModel);
							if (callback) {
								callback(archetypeModel);
							}
						}
					);
				} else {
					var archetypeModel = new AOM.ArchetypeModel(data);
					if (callback) {
						callback(archetypeModel);
					}
				}
			});
		}
	})
	.directive("tree", function(RecursionHelper) {
		return {
			restrict: "E",
			scope: {
				data: '='
			},
			templateUrl: 'templates/tree.html',
			compile: function(element) {
				return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){

					scope.expCol = function (data,e) {
						var exp = data.exp = !data.exp;

						if(e.metaKey){
							(function climb(data){
								data.forEach(function (d) {
									d.exp = exp;
									if(d.children) climb(d.children);
								});
							})(data.children);
						}
					}

					scope.form = function (node) {
						// get root scope
						var rootScope = (function getRoot(scope){
							if(scope.$parent && !scope.$parent.data) return scope;
							return getRoot(scope.$parent);
						})(scope);

						// reset selected
						(function climb(data){
							data.forEach(function (d) {
								d.selected = false;
								if(d.children) climb(d.children);
							});
						})(rootScope.data);

						node.selected = !node.selected;
						rootScope.$parent.main.form.apply(rootScope.$parent.main,[node]);
					}

					
				});
			}
		};
	})
	.controller('FormCtrl', function () {
		var form = this;

		this.save = function () {
			console.log('save',form.data);
		}
	})

