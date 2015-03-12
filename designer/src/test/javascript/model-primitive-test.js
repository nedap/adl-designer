describe("CRealHandler", function () {

    var handler = ReferenceModels.Primitive.getHandler("C_REAL", "C_REAL");

    it("is found", function () {
        expect(handler).not.toBeUndefined();
    });

    it("creates range gui", function () {
        var rangeCons = {
            "@type": "C_REAL",
            "list": [],
            "range": {
                "@type": "INTERVAL_OF_REAL",
                "lower": 0,
                "upper": 100,
                "lower_included": true,
                "upper_included": true,
                "lower_unbounded": false,
                "upper_unbounded": false
            },
            "occurrences": {
                "@type": "MULTIPLICITY_INTERVAL",
                "lower_included": true,
                "upper_included": true,
                "lower_unbounded": false,
                "upper_unbounded": false,
                "lower": 1,
                "upper": 1
            },
            "rm_type_name": "C_REAL"
        };
        var gui = handler.createModel(undefined, rangeCons);
        expect(gui.range.lower).toEqual(0);
        expect(gui.range.upper).toEqual(100);

    });

    it("detects invalid occurrences", function () {
        var cons = {
            "@type": "C_REAL",
            "list": [],
            "range": {
                "@type": "INTERVAL_OF_REAL",
                "lower": 0,
                "upper": 100,
                "lower_included": true,
                "upper_included": true,
                "lower_unbounded": false,
                "upper_unbounded": false
            },
            "occurrences": {
                "@type": "MULTIPLICITY_INTERVAL",
                "lower_included": true,
                "upper_included": true,
                "lower_unbounded": false,
                "upper_unbounded": false,
                "lower": 2,
                "upper": 1
            },
            "rm_type_name": "C_REAL"
        };
        var gui = handler.createModel(undefined, cons);
        var errors = new AmUtils.Errors();
        handler.validateModel(undefined, gui, cons, errors);
        expect(errors.empty()).toEqual(false);
        expect(errors.getErrors().length).toEqual(1);
        expect(errors.getErrors()[0].error).toEqual("constraint.validation.invalid_occurrences");
    });

    it("updates range", function () {
        var cons = {
            "@type": "C_REAL",
            "list": [],
            "range": {
                "@type": "INTERVAL_OF_REAL",
                "lower": 0,
                "upper": 100,
                "lower_included": true,
                "upper_included": true,
                "lower_unbounded": false,
                "upper_unbounded": false
            },
            "rm_type_name": "C_REAL"
        };
        var gui = handler.createModel(undefined, cons);
        gui.range.lower=10;
        handler.saveModel(undefined, gui, cons);
        expect(cons.range.lower).toEqual(10);
    });


});

describe("CBooleanHandler", function () {
    var handler = ReferenceModels.Primitive.getHandler("C_BOOLEAN", "C_BOOLEAN");
    it("is found", function () {
        expect(handler).not.toBeUndefined();
    });

});