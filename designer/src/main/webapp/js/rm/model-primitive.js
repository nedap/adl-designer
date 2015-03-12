(function (ReferenceModels) {
    ReferenceModels.Primitive = (function () {
        var my = this;
        var handlers = {};

        var CBooleanHandler = function () {
            var handler = this;
            ReferenceModels.BaseHandler.call(handler);

            handler.createModel = function (archetypeModel, cons) {
                cons = cons || {};
                var gui = handler.createModelBase(archetypeModel, cons);
                gui.true_valid = cons.true_valid !== false;
                gui.false_valid = cons.false_valid !== true;
                gui.assumed_value = cons.assumed_value;

                return gui;
            };


            handler.validateModel = function (archetypeModel, gui, cons, errors) {
                handler.validateModelBase(archetypeModel, gui, cons, errors);

                if (!gui.false_valid && !gui.true_valid) {
                    errors.add("constraint.validation.no_valid_values");
                }
                if (gui.assumed_value !== undefined) {
                    if (typeof gui.assumed_value !== "boolean"
                        || gui.assumed_value && !gui.true_valid
                        || !gui.assumed_value && !gui.false_valid) {
                        errors.add("constraint.validation.invalid_assumed_value", "assumed_value");
                    }
                }
            };

            handler.saveModel = function (archetypeModel, gui, cons) {
                handler.saveModelBase(archetypeModel, gui, cons);

                cons.true_valid = gui.true_valid;
                cons.false_valid = gui.false_valid;
                cons.assumed_value = gui.assumed_value;
            };
        };
        AmUtils.extend(CBooleanHandler, ReferenceModels.BaseHandler);


        var CRealHandler = function () {
            var handler = this;
            ReferenceModels.BaseHandler.call(handler);

            handler.createModel = function (archetypeModel, cons) {
                cons = cons || {};
                var gui = handler.createModelBase(archetypeModel, cons);

                gui.range = ReferenceModels.consIntervalToGui(cons.range);
                gui.assumed_value = cons.assumed_value;
                return gui;

            };


            handler.validateModel = function (archetypeModel, gui, cons, errors) {
                handler.validateModelBase(archetypeModel, gui, cons, errors);
                // todo validate C_REAL
            };

            handler.saveModel = function (archetypeModel, gui, cons) {
                handler.saveModelBase(archetypeModel, gui, cons);

                if (gui.range.lower !== undefined || gui.range.upper !== undefined) {
                    cons.range = AmInterval.of(gui.range.lower, gui.range.upper, "INTERVAL_OF_REAL");
                } else {
                    delete cons.range;
                }
                cons.false_valid = gui.false_valid;
                cons.assumed_value = gui.assumed_value;
            };
        };
        AmUtils.extend(CRealHandler, ReferenceModels.BaseHandler);





        handlers["C_BOOLEAN"] = new CBooleanHandler();
        handlers["C_REAL"] = new CRealHandler();



        my.getHandler = function (amType, rmType) {
            return handlers[rmType];
        };

        return my;
    }());
}(ReferenceModels) );