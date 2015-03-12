var ReferenceModels = (function () {
        var my = this;

        my.consIntervalToGui = function (interval) {
            if (!interval) {
                return {
                    lower_included: true,
                    upper_included: true
                }
            }
            return {
                lower_included: interval.lower_included,
                upper_included: interval.upper_included,
                lower: interval.lower_unbounded ? undefined : interval.lower,
                upper: interval.upper_unbounded ? undefined : interval.upper
            }
        };


        /**
         * @constructor
         */
        my.BaseHandler = function () {
            var handler = this;

            handler.createModelBase = function (archetypeModel, cons) {
                cons = cons || {};
                var gui = {};
                gui.node_id = cons.node_id;
                if (cons.occurrences) {
                    gui.occurrences = consIntervalToGui(cons.occurrences);
                } else {
                    gui.occurrences = {
                        lower_included: true,
                        upper_included: true,
                        lower: 0,
                        upper: 1
                    }
                }

                return gui;            };


            /**
             * Creates context (a gui model from existing or new constrains)
             * @param {AOM.EditableArchetypeModel} archetypeModel model of the archetype
             * @param {object} cons Object for which to create the context. undefined if it does not exist yet
             * @returns {object} guiModel
             */
            handler.createModel = function (archetypeModel, cons) {
            };


            handler.validateModelBase = function (archetypeModel, gui, cons, errors) {
                if (gui.occurrences.lower !== undefined && gui.occurrences.lower < 0) {
                    errors.add("constraint.validation.invalid_occurrences", "occurrences");
                }
                if (gui.occurrences.lower !== undefined && gui.occurrences.upper !== undefined) {
                    if (gui.occurrences.lower > gui.occurrences.upper) {
                        errors.add("constraint.validation.invalid_occurrences", "occurrences");
                    }
                }
            };

            /**
             * Validates a gui model
             * @param {AOM.EditableArchetypeModel} archetypeModel model of the archetype
             * @param {object} gui to validate
             * @param {object} cons constraint object
             * @param {AmUtils.Errors} errors Target for any validation errors
             */
            handler.validateModel = function (archetypeModel, gui, cons, errors) {
            };


            handler.saveModelBase = function (archetypeModel, gui, cons) {
                cons.occurrences = AmInterval.of(gui.occurrences.lower, gui.occurrences.upper, "MULTIPLICITY_INTERVAL");
            };

            /**
             * Updates constraint values from the context values.
             *
             * @param {object} archetypeModel archetypeModel model of the archetype
             * @param gui contains values that are to be copied on the context
             * @param cons target constrains where the context values will be written
             */
            handler.saveModel = function (archetypeModel, gui, cons) {
            };
        };
        return my;
    }()
    )
    ;