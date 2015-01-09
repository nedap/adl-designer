var archetypeModels = {
    source: {
        "openEHR-EHR-EVALUATION.alert.v1": {
            "description": {
                "original_author": [
                    {
                        "value": "Sam Heard",
                        "id": "name"
                    },
                    {
                        "value": "Ocean Informatics",
                        "id": "organisation"
                    },
                    {
                        "value": "sam.heard@oceaninformatics.biz",
                        "id": "email"
                    },
                    {
                        "value": "23/04/2006",
                        "id": "date"
                    }
                ],
                "other_contributors": ["NEHTA data groups (Australia)"],
                "lifecycle_state": "AuthorDraft",
                "details": [
                    {
                        "language": {
                            "terminology_id": {
                                "value": "ISO_639-1"
                            },
                            "code_string": "de"
                        },
                        "purpose": "Zur Dokumentation beliebiger Warnungen in der Patientenakte",
                        "keywords": [
                            "notabene",
                            "Warnung"
                        ],
                        "use": "",
                        "misuse": "",
                        "copyright": "copyright (c) 2010 openEHR foundation",
                        "original_resource_uri": []
                    },
                    {
                        "language": {
                            "terminology_id": {
                                "value": "ISO_639-1"
                            },
                            "code_string": "en"
                        },
                        "purpose": "For recording alerts of any kind in the health record",
                        "keywords": [
                            "nota bene",
                            "warning"
                        ],
                        "use": "",
                        "misuse": "",
                        "copyright": "copyright (c) 2010 openEHR foundation",
                        "original_resource_uri": []
                    }
                ]
            },
            "translations": [
                {
                    "language": {
                        "terminology_id": {
                            "value": "ISO_639-1"
                        },
                        "code_string": "de"
                    },
                    "author": [
                        {
                            "value": "University of Heidelberg, Central Queensland University",
                            "id": "organisation"
                        },
                        {
                            "value": "Jasmin Buck, Sebastian Garde",
                            "id": "name"
                        }
                    ],
                    "accreditation": null,
                    "other_details": []
                }
            ],
            "concept": "at0000",
            "definition": {
                "attributes": [
                    {
                        "rm_attribute_name": "data",
                        "existence": {
                            "lower_included": true,
                            "upper_included": true,
                            "lower_unbounded": false,
                            "upper_unbounded": false,
                            "lower": 1,
                            "upper": 1
                        },
                        "match_negated": false,
                        "children": [
                            {
                                "attributes": [
                                    {
                                        "rm_attribute_name": "items",
                                        "existence": {
                                            "lower_included": true,
                                            "upper_included": true,
                                            "lower_unbounded": false,
                                            "upper_unbounded": false,
                                            "lower": 1,
                                            "upper": 1
                                        },
                                        "match_negated": false,
                                        "children": [
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "defining_code",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "code_list": ["ac0001"],
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_TERMINOLOGY_CODE"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_CODED_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0002"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 1,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0003"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "value",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "pattern": "yyyy-??-??T??:??:??",
                                                                                "range": null,
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_DATE_TIME"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_DATE_TIME"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0004"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "defining_code",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "terminology_id": "local",
                                                                                "code_list": [
                                                                                    "at0006",
                                                                                    "at0007",
                                                                                    "at0008"
                                                                                ],
                                                                                "rm_type_name": "CODE_PHRASE"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_CODED_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0005"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "defining_code",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "terminology_id": "local",
                                                                                "code_list": [
                                                                                    "at0011",
                                                                                    "at0012",
                                                                                    "at0013"
                                                                                ],
                                                                                "rm_type_name": "CODE_PHRASE"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_CODED_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0009"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "value",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "pattern": "yyyy-??-??T??:??:??",
                                                                                "range": null,
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_DATE_TIME"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_DATE_TIME"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0010"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "value",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "pattern": "yyyy-??-??T??:??:??",
                                                                                "range": null,
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_DATE_TIME"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_DATE_TIME"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0014"
                                            }
                                        ]
                                    }
                                ],
                                "occurrences": {
                                    "lower_included": true,
                                    "upper_included": true,
                                    "lower_unbounded": false,
                                    "upper_unbounded": false,
                                    "lower": 1,
                                    "upper": 1
                                },
                                "rm_type_name": "ITEM_LIST",
                                "node_id": "at0001"
                            }
                        ]
                    }
                ],
                "occurrences": {
                    "lower_included": true,
                    "upper_included": true,
                    "lower_unbounded": false,
                    "upper_unbounded": false,
                    "lower": 1,
                    "upper": 1
                },
                "rm_type_name": "EVALUATION",
                "node_id": "at0000"
            },
            "ontology": {
                "term_definitions": [
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "Warnung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Informationen, die eine zu behandelnde Person betreffen und besondere Betrachtung eines Klinikers benötigen, bevor über seine/ihre Handlungen entschieden wird, um ein ungewolltes Ereignis zu verhindern, oder Informationen bezüglich der Sicherheit der zu behandelnden Person oder der Gesundheitsdienstleister oder bezüglich besonderer Umstände, die für die Leistungserbringung von Bedeutung sind.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0000"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Liste",
                                        "id": "text"
                                    },
                                    {
                                        "value": "@ internal @",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0001"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Kategorie",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Kategorie der Warnung",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0002"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Beschreibung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Einzelheiten der Warnung",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0003"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Start der Warnung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Datum und Zeitpunkt, zu dem das Problem oder Ereignis begonnen hat",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0004"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Sicherheit",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Ein Hinweis auf das Vertrauen bezüglich des Vorliegens der Warnung",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0005"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Bestätigt",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Ereignis oder die Warnung wurde bestätigt",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0006"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Vermuted",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Problem oder Ereignis wird vermutet",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0007"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Unwahrscheinlich",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Problem oder Ereignis ist unwahrscheinlich",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0008"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Zustand",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Ein Hinweis, ob die Warnung als aktives oder inaktives Problem angesehen wird",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0009"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Kontrollzeitpunkt",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Datum und der Zeitpunkt, wann die Warnung eine Kontrolle erfordert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0010"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Aktiv",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Warnung ist aktiv",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0011"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Inaktiv",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Warnung ist momentan inaktiv",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0012"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Aufgehoben",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Warnung wurde aufgehoben",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0013"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Ende der Warnung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Ende das Warnzeitraumes, falls bekannt",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0014"
                            }
                        ],
                        "language": "de"
                    },
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "Alert",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0000"
                            },
                            {
                                "items": [
                                    {
                                        "value": "List",
                                        "id": "text"
                                    },
                                    {
                                        "value": "@ internal @",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0001"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Category",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The category of alert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0002"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Description",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Details of the alert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0003"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Start of alert",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The date/time tat the issue or event commenced",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0004"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Certainty",
                                        "id": "text"
                                    },
                                    {
                                        "value": "An indication of confidence concerning the existence of the alert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0005"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Confirmed",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The event or alert has been confirmed",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0006"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Suspected",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The issue or event is suspected to be present",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0007"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Discounted",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The issue or event has been discounted",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0008"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Status",
                                        "id": "text"
                                    },
                                    {
                                        "value": "An indication of whether the alert is considered to be an active or inactive issue",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0009"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Review on",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The date and time the alert requires review",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0010"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Active",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The alert is active",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0011"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Inactive",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The alert is not active at present",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0012"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Resolved",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The alert has resolved",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0013"
                            },
                            {
                                "items": [
                                    {
                                        "value": "End of alert",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The end of the alert period if known",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0014"
                            }
                        ],
                        "language": "en"
                    }
                ],
                "constraint_definitions": [
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "Eine Kategorie von Warnungen",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Kodierte Kategorien von Warnungen, basierend auf einem Domänenvokabular",
                                        "id": "description"
                                    }
                                ],
                                "code": "ac0001"
                            }
                        ],
                        "language": "de"
                    },
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "A category of alert based",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Coded categories of alerts based on a domain vocabulary",
                                        "id": "description"
                                    }
                                ],
                                "code": "ac0001"
                            }
                        ],
                        "language": "en"
                    }
                ],
                "term_bindings": [],
                "constraint_bindings": [],
                "terminology_extracts": []
            },
            "original_language": {
                "terminology_id": {
                    "value": "ISO_639-1"
                },
                "code_string": "en"
            },
            "is_controlled": false,
            "uid": null,
            "archetype_id": {
                "value": "openEHR-EHR-EVALUATION.alert.v1"
            },
            "adl_version": "1.5",
            "is_template": false,
            "is_overlay": false
        },

        "openEHR-EHR-EVALUATION.alert-zn.v1": {
          "description" : {
            "original_author" : [ {
              "value" : "Sam Heard",
              "id" : "name"
            }, {
              "value" : "Ocean Informatics",
              "id" : "organisation"
            }, {
              "value" : "sam.heard@oceaninformatics.biz",
              "id" : "email"
            }, {
              "value" : "23/04/2006",
              "id" : "date"
            } ],
            "other_contributors" : [ "NEHTA data groups (Australia)", "Ian McNicoll, Ocean Informatics, UK" ],
            "lifecycle_state" : "AuthorDraft",
            "details" : [ {
              "language" : {
                "terminology_id" : {
                  "value" : "ISO_639-1"
                },
                "code_string" : "de"
              },
              "purpose" : "Zur Dokumentation beliebiger Warnungen in der Patientenakte",
              "keywords" : [ "notabene", "Warnung" ],
              "use" : "",
              "misuse" : "",
              "copyright" : "copyright (c) 2010 openEHR Foundation",
              "original_resource_uri" : [ ]
            }, {
              "language" : {
                "terminology_id" : {
                  "value" : "ISO_639-1"
                },
                "code_string" : "en"
              },
              "purpose" : "For recording alerts of any kind in the health record",
              "keywords" : [ "nota bene", "warning" ],
              "use" : "",
              "misuse" : "",
              "copyright" : "copyright (c) 2010 openEHR Foundation",
              "original_resource_uri" : [ ]
            } ]
          },
          "translations" : [ {
            "language" : {
              "terminology_id" : {
                "value" : "ISO_639-1"
              },
              "code_string" : "de"
            },
            "author" : [ {
              "value" : "University of Heidelberg, Central Queensland University",
              "id" : "organisation"
            }, {
              "value" : "Jasmin Buck, Sebastian Garde",
              "id" : "name"
            } ],
            "accreditation" : null,
            "other_details" : [ ]
          } ],
          "definition" : {
            "attributes" : [ {
              "rm_attribute_name" : "items",
              "existence" : {
                "lower_included" : true,
                "upper_included" : true,
                "lower_unbounded" : false,
                "upper_unbounded" : false,
                "lower" : 1,
                "upper" : 1
              },
              "differential_path" : "/data[at0001]/items",
              "match_negated" : false,
              "children" : [ {
                "attributes" : [ {
                  "rm_attribute_name" : "value",
                  "existence" : {
                    "lower_included" : true,
                    "upper_included" : true,
                    "lower_unbounded" : false,
                    "upper_unbounded" : false,
                    "lower" : 1,
                    "upper" : 1
                  },
                  "match_negated" : false,
                  "children" : [ {
                    "attributes" : [ {
                      "rm_attribute_name" : "defining_code",
                      "existence" : {
                        "lower_included" : true,
                        "upper_included" : true,
                        "lower_unbounded" : false,
                        "upper_unbounded" : false,
                        "lower" : 1,
                        "upper" : 1
                      },
                      "match_negated" : false,
                      "children" : [ {
                        "terminology_id" : "local",
                        "code_list" : [ "at0.15", "at0.16", "at0.17", "at0.18", "at0.19", "at0.20", "at0.21", "at0.22" ],
                        "rm_type_name" : "CODE_PHRASE"
                      } ]
                    } ],
                    "occurrences" : {
                      "lower_included" : true,
                      "upper_included" : true,
                      "lower_unbounded" : false,
                      "upper_unbounded" : false,
                      "lower" : 1,
                      "upper" : 1
                    },
                    "rm_type_name" : "DV_CODED_TEXT"
                  } ]
                } ],
                "occurrences" : {
                  "lower_included" : true,
                  "upper_included" : true,
                  "lower_unbounded" : false,
                  "upper_unbounded" : false,
                  "lower" : 1,
                  "upper" : 1
                },
                "rm_type_name" : "ELEMENT",
                "node_id" : "at0003"
              } ],
              "cardinality" : {
                "is_ordered" : false,
                "is_unique" : false,
                "interval" : {
                  "lower_included" : true,
                  "upper_included" : false,
                  "lower_unbounded" : false,
                  "upper_unbounded" : true,
                  "lower" : 1,
                  "upper" : null
                }
              }
            } ],
            "occurrences" : {
              "lower_included" : true,
              "upper_included" : true,
              "lower_unbounded" : false,
              "upper_unbounded" : false,
              "lower" : 1,
              "upper" : 1
            },
            "rm_type_name" : "EVALUATION",
            "node_id" : "at0000.1"
          },
          "ontology" : {
            "term_definitions" : [ {
              "items" : [ {
                "items" : [ {
                  "value" : "*Falls(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of falls.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.15"
              }, {
                "items" : [ {
                  "value" : "*Skin breakdown(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of skin breakdown.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.16"
              }, {
                "items" : [ {
                  "value" : "*Seizures(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of seizures.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.17"
              }, {
                "items" : [ {
                  "value" : "*Communicable disease(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of communicable disease(en)",
                  "id" : "description"
                } ],
                "code" : "at0.18"
              }, {
                "items" : [ {
                  "value" : "*Aspiration(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of aspiration.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.19"
              }, {
                "items" : [ {
                  "value" : "*Hypo-hyperglycaemia(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at risk of hypoglycaemia or hyperglycaemia.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.20"
              }, {
                "items" : [ {
                  "value" : "*Harm to self(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at risk of self-harm.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.21"
              }, {
                "items" : [ {
                  "value" : "*Harm to others(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient represents a risk to others.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.22"
              }, {
                "items" : [ {
                  "value" : "*Alert!(en)",
                  "id" : "text"
                }, {
                  "value" : "*Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care!(en)",
                  "id" : "description"
                } ],
                "code" : "at0000.1"
              } ],
              "language" : "de"
            }, {
              "items" : [ {
                "items" : [ {
                  "value" : "*Falls(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of falls.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.15"
              }, {
                "items" : [ {
                  "value" : "*Skin breakdown(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of skin breakdown.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.16"
              }, {
                "items" : [ {
                  "value" : "*Seizures(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of seizures.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.17"
              }, {
                "items" : [ {
                  "value" : "*Communicable disease(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of communicable disease(en)",
                  "id" : "description"
                } ],
                "code" : "at0.18"
              }, {
                "items" : [ {
                  "value" : "*Aspiration(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at-risk of aspiration.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.19"
              }, {
                "items" : [ {
                  "value" : "*Hypo-hyperglycaemia(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at risk of hypoglycaemia or hyperglycaemia.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.20"
              }, {
                "items" : [ {
                  "value" : "*Harm to self(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient is at risk of self-harm.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.21"
              }, {
                "items" : [ {
                  "value" : "*Harm to others(en)",
                  "id" : "text"
                }, {
                  "value" : "*The patient represents a risk to others.(en)",
                  "id" : "description"
                } ],
                "code" : "at0.22"
              }, {
                "items" : [ {
                  "value" : "*Alert(en)",
                  "id" : "text"
                }, {
                  "value" : "*Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care. Specialised  for ISPEK nursing alerts.(en)",
                  "id" : "description"
                } ],
                "code" : "at0000.1"
              } ],
              "language" : "sl"
            }, {
              "items" : [ {
                "items" : [ {
                  "value" : "Falls",
                  "id" : "text"
                }, {
                  "value" : "The patient is at-risk of falls.",
                  "id" : "description"
                } ],
                "code" : "at0.15"
              }, {
                "items" : [ {
                  "value" : "Skin breakdown",
                  "id" : "text"
                }, {
                  "value" : "The patient is at-risk of skin breakdown.",
                  "id" : "description"
                } ],
                "code" : "at0.16"
              }, {
                "items" : [ {
                  "value" : "Seizures",
                  "id" : "text"
                }, {
                  "value" : "The patient is at-risk of seizures.",
                  "id" : "description"
                } ],
                "code" : "at0.17"
              }, {
                "items" : [ {
                  "value" : "Communicable disease",
                  "id" : "text"
                }, {
                  "value" : "The patient is at-risk of communicable disease",
                  "id" : "description"
                } ],
                "code" : "at0.18"
              }, {
                "items" : [ {
                  "value" : "Aspiration",
                  "id" : "text"
                }, {
                  "value" : "The patient is at-risk of aspiration.",
                  "id" : "description"
                } ],
                "code" : "at0.19"
              }, {
                "items" : [ {
                  "value" : "Hypo-hyperglycaemia",
                  "id" : "text"
                }, {
                  "value" : "The patient is at risk of hypoglycaemia or hyperglycaemia.",
                  "id" : "description"
                } ],
                "code" : "at0.20"
              }, {
                "items" : [ {
                  "value" : "Harm to self",
                  "id" : "text"
                }, {
                  "value" : "The patient is at risk of self-harm.",
                  "id" : "description"
                } ],
                "code" : "at0.21"
              }, {
                "items" : [ {
                  "value" : "Harm to others",
                  "id" : "text"
                }, {
                  "value" : "The patient represents a risk to others.",
                  "id" : "description"
                } ],
                "code" : "at0.22"
              }, {
                "items" : [ {
                  "value" : "Alert",
                  "id" : "text"
                }, {
                  "value" : "Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care. Specialised  for ISPEK nursing alerts.",
                  "id" : "description"
                } ],
                "code" : "at0000.1"
              } ],
              "language" : "en"
            } ],
            "constraint_definitions" : [ ],
            "term_bindings" : [ ],
            "constraint_bindings" : [ ],
            "terminology_extracts" : [ ]
          },
          "original_language" : {
            "terminology_id" : {
              "value" : "ISO_639-1"
            },
            "code_string" : "en"
          },
          "is_controlled" : false,
          "uid" : null,
          "archetype_id" : {
            "value" : "openEHR-EHR-EVALUATION.alert-zn.v1"
          },
          "adl_version" : "1.5",
          "parent_archetype_id" : {
            "value" : "openEHR-EHR-EVALUATION.alert.v1"
          },
          "is_template" : false,
          "is_overlay" : false
        }
    },

    flat: {
        "openEHR-EHR-EVALUATION.alert-zn.v1": {
            "description": {
                "original_author": [
                    {
                        "value": "Sam Heard",
                        "id": "name"
                    },
                    {
                        "value": "Ocean Informatics",
                        "id": "organisation"
                    },
                    {
                        "value": "sam.heard@oceaninformatics.biz",
                        "id": "email"
                    },
                    {
                        "value": "23/04/2006",
                        "id": "date"
                    }
                ],
                "other_contributors": [ "NEHTA data groups (Australia)", "Ian McNicoll, Ocean Informatics, UK" ],
                "lifecycle_state": "AuthorDraft",
                "details": [
                    {
                        "language": {
                            "terminology_id": {
                                "value": "ISO_639-1"
                            },
                            "code_string": "de"
                        },
                        "purpose": "Zur Dokumentation beliebiger Warnungen in der Patientenakte",
                        "keywords": [ "notabene", "Warnung" ],
                        "use": "",
                        "misuse": "",
                        "copyright": "copyright (c) 2010 openEHR Foundation",
                        "original_resource_uri": [ ]
                    },
                    {
                        "language": {
                            "terminology_id": {
                                "value": "ISO_639-1"
                            },
                            "code_string": "en"
                        },
                        "purpose": "For recording alerts of any kind in the health record",
                        "keywords": [ "nota bene", "warning" ],
                        "use": "",
                        "misuse": "",
                        "copyright": "copyright (c) 2010 openEHR Foundation",
                        "original_resource_uri": [ ]
                    }
                ]
            },
            "translations": [
                {
                    "language": {
                        "terminology_id": {
                            "value": "ISO_639-1"
                        },
                        "code_string": "de"
                    },
                    "author": [
                        {
                            "value": "University of Heidelberg, Central Queensland University",
                            "id": "organisation"
                        },
                        {
                            "value": "Jasmin Buck, Sebastian Garde",
                            "id": "name"
                        }
                    ],
                    "accreditation": null,
                    "other_details": [ ]
                }
            ],
            "annotations": [ ],
            "definition": {
                "attributes": [
                    {
                        "rm_attribute_name": "data",
                        "existence": {
                            "lower_included": true,
                            "upper_included": true,
                            "lower_unbounded": false,
                            "upper_unbounded": false,
                            "lower": 1,
                            "upper": 1
                        },
                        "match_negated": false,
                        "children": [
                            {
                                "attributes": [
                                    {
                                        "rm_attribute_name": "items",
                                        "existence": {
                                            "lower_included": true,
                                            "upper_included": true,
                                            "lower_unbounded": false,
                                            "upper_unbounded": false,
                                            "lower": 1,
                                            "upper": 1
                                        },
                                        "match_negated": false,
                                        "children": [
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "defining_code",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "code_list": [ "ac0001" ],
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_TERMINOLOGY_CODE"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_CODED_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0002"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "defining_code",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "terminology_id": "local",
                                                                                "code_list": [ "at0.15", "at0.16", "at0.17", "at0.18", "at0.19", "at0.20", "at0.21", "at0.22" ],
                                                                                "rm_type_name": "CODE_PHRASE"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_CODED_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 1,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0003"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "value",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "pattern": "yyyy-??-??T??:??:??",
                                                                                "range": null,
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_DATE_TIME"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_DATE_TIME"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0004"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "defining_code",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "terminology_id": "local",
                                                                                "code_list": [ "at0006", "at0007", "at0008" ],
                                                                                "rm_type_name": "CODE_PHRASE"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_CODED_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0005"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "defining_code",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "terminology_id": "local",
                                                                                "code_list": [ "at0011", "at0012", "at0013" ],
                                                                                "rm_type_name": "CODE_PHRASE"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_CODED_TEXT"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0009"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "value",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "pattern": "yyyy-??-??T??:??:??",
                                                                                "range": null,
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_DATE_TIME"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_DATE_TIME"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0010"
                                            },
                                            {
                                                "attributes": [
                                                    {
                                                        "rm_attribute_name": "value",
                                                        "existence": {
                                                            "lower_included": true,
                                                            "upper_included": true,
                                                            "lower_unbounded": false,
                                                            "upper_unbounded": false,
                                                            "lower": 1,
                                                            "upper": 1
                                                        },
                                                        "match_negated": false,
                                                        "children": [
                                                            {
                                                                "attributes": [
                                                                    {
                                                                        "rm_attribute_name": "value",
                                                                        "existence": {
                                                                            "lower_included": true,
                                                                            "upper_included": true,
                                                                            "lower_unbounded": false,
                                                                            "upper_unbounded": false,
                                                                            "lower": 1,
                                                                            "upper": 1
                                                                        },
                                                                        "match_negated": false,
                                                                        "children": [
                                                                            {
                                                                                "pattern": "yyyy-??-??T??:??:??",
                                                                                "range": null,
                                                                                "occurrences": {
                                                                                    "lower_included": true,
                                                                                    "upper_included": true,
                                                                                    "lower_unbounded": false,
                                                                                    "upper_unbounded": false,
                                                                                    "lower": 1,
                                                                                    "upper": 1
                                                                                },
                                                                                "rm_type_name": "C_DATE_TIME"
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                "occurrences": {
                                                                    "lower_included": true,
                                                                    "upper_included": true,
                                                                    "lower_unbounded": false,
                                                                    "upper_unbounded": false,
                                                                    "lower": 1,
                                                                    "upper": 1
                                                                },
                                                                "rm_type_name": "DV_DATE_TIME"
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "occurrences": {
                                                    "lower_included": true,
                                                    "upper_included": true,
                                                    "lower_unbounded": false,
                                                    "upper_unbounded": false,
                                                    "lower": 0,
                                                    "upper": 1
                                                },
                                                "rm_type_name": "ELEMENT",
                                                "node_id": "at0014"
                                            }
                                        ],
                                        "cardinality": {
                                            "is_ordered": false,
                                            "is_unique": false,
                                            "interval": {
                                                "lower_included": true,
                                                "upper_included": false,
                                                "lower_unbounded": false,
                                                "upper_unbounded": true,
                                                "lower": 1,
                                                "upper": null
                                            }
                                        }
                                    }
                                ],
                                "occurrences": {
                                    "lower_included": true,
                                    "upper_included": true,
                                    "lower_unbounded": false,
                                    "upper_unbounded": false,
                                    "lower": 1,
                                    "upper": 1
                                },
                                "rm_type_name": "ITEM_LIST",
                                "node_id": "at0001"
                            }
                        ]
                    }
                ],
                "occurrences": {
                    "lower_included": true,
                    "upper_included": true,
                    "lower_unbounded": false,
                    "upper_unbounded": false,
                    "lower": 1,
                    "upper": 1
                },
                "rm_type_name": "EVALUATION",
                "node_id": "at0000.1"
            },
            "invariants": [ ],
            "ontology": {
                "term_definitions": [
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "*Falls(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of falls.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.15"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Skin breakdown(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of skin breakdown.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.16"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Seizures(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of seizures.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.17"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Communicable disease(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of communicable disease(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.18"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Aspiration(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of aspiration.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.19"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Hypo-hyperglycaemia(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at risk of hypoglycaemia or hyperglycaemia.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.20"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Harm to self(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at risk of self-harm.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.21"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Harm to others(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient represents a risk to others.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.22"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Alert!(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care!(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0000.1"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Warnung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Informationen, die eine zu behandelnde Person betreffen und besondere Betrachtung eines Klinikers benötigen, bevor über seine/ihre Handlungen entschieden wird, um ein ungewolltes Ereignis zu verhindern, oder Informationen bezüglich der Sicherheit der zu behandelnden Person oder der Gesundheitsdienstleister oder bezüglich besonderer Umstände, die für die Leistungserbringung von Bedeutung sind.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0000"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Liste",
                                        "id": "text"
                                    },
                                    {
                                        "value": "@ internal @",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0001"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Kategorie",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Kategorie der Warnung",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0002"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Beschreibung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Einzelheiten der Warnung",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0003"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Start der Warnung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Datum und Zeitpunkt, zu dem das Problem oder Ereignis begonnen hat",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0004"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Sicherheit",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Ein Hinweis auf das Vertrauen bezüglich des Vorliegens der Warnung",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0005"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Bestätigt",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Ereignis oder die Warnung wurde bestätigt",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0006"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Vermuted",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Problem oder Ereignis wird vermutet",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0007"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Unwahrscheinlich",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Problem oder Ereignis ist unwahrscheinlich",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0008"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Zustand",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Ein Hinweis, ob die Warnung als aktives oder inaktives Problem angesehen wird",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0009"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Kontrollzeitpunkt",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Datum und der Zeitpunkt, wann die Warnung eine Kontrolle erfordert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0010"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Aktiv",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Warnung ist aktiv",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0011"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Inaktiv",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Warnung ist momentan inaktiv",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0012"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Aufgehoben",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Die Warnung wurde aufgehoben",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0013"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Ende der Warnung",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Das Ende das Warnzeitraumes, falls bekannt",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0014"
                            }
                        ],
                        "language": "de"
                    },
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "*Falls(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of falls.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.15"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Skin breakdown(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of skin breakdown.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.16"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Seizures(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of seizures.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.17"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Communicable disease(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of communicable disease(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.18"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Aspiration(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at-risk of aspiration.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.19"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Hypo-hyperglycaemia(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at risk of hypoglycaemia or hyperglycaemia.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.20"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Harm to self(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient is at risk of self-harm.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.21"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Harm to others(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*The patient represents a risk to others.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.22"
                            },
                            {
                                "items": [
                                    {
                                        "value": "*Alert(en)",
                                        "id": "text"
                                    },
                                    {
                                        "value": "*Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care. Specialised  for ISPEK nursing alerts.(en)",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0000.1"
                            }
                        ],
                        "language": "sl"
                    },
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "Falls",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient is at-risk of falls.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.15"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Skin breakdown",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient is at-risk of skin breakdown.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.16"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Seizures",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient is at-risk of seizures.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.17"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Communicable disease",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient is at-risk of communicable disease",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.18"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Aspiration",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient is at-risk of aspiration.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.19"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Hypo-hyperglycaemia",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient is at risk of hypoglycaemia or hyperglycaemia.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.20"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Harm to self",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient is at risk of self-harm.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.21"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Harm to others",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The patient represents a risk to others.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0.22"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Alert",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care. Specialised  for ISPEK nursing alerts.",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0000.1"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Alert",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Information pertaining to a subject of care that may need special consideration by a healthcare provider before making a decision about his/her actions in order to avert an unfavourable healthcare event, or relate to the safety of subject or providers, or pertain to special circumstances relevant to the delivery of care",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0000"
                            },
                            {
                                "items": [
                                    {
                                        "value": "List",
                                        "id": "text"
                                    },
                                    {
                                        "value": "@ internal @",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0001"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Category",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The category of alert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0002"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Description",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Details of the alert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0003"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Start of alert",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The date/time tat the issue or event commenced",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0004"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Certainty",
                                        "id": "text"
                                    },
                                    {
                                        "value": "An indication of confidence concerning the existence of the alert",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0005"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Confirmed",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The event or alert has been confirmed",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0006"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Suspected",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The issue or event is suspected to be present",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0007"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Discounted",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The issue or event has been discounted",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0008"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Status",
                                        "id": "text"
                                    },
                                    {
                                        "value": "An indication of whether the alert is considered to be an active or inactive issue",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0009"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Review on",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The date and time the alert requires review",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0010"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Active",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The alert is active",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0011"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Inactive",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The alert is not active at present",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0012"
                            },
                            {
                                "items": [
                                    {
                                        "value": "Resolved",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The alert has resolved",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0013"
                            },
                            {
                                "items": [
                                    {
                                        "value": "End of alert",
                                        "id": "text"
                                    },
                                    {
                                        "value": "The end of the alert period if known",
                                        "id": "description"
                                    }
                                ],
                                "code": "at0014"
                            }
                        ],
                        "language": "en"
                    }
                ],
                "constraint_definitions": [
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "Eine Kategorie von Warnungen",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Kodierte Kategorien von Warnungen, basierend auf einem Domänenvokabular",
                                        "id": "description"
                                    }
                                ],
                                "code": "ac0001"
                            }
                        ],
                        "language": "de"
                    },
                    {
                        "items": [
                            {
                                "items": [
                                    {
                                        "value": "A category of alert based",
                                        "id": "text"
                                    },
                                    {
                                        "value": "Coded categories of alerts based on a domain vocabulary",
                                        "id": "description"
                                    }
                                ],
                                "code": "ac0001"
                            }
                        ],
                        "language": "en"
                    }
                ],
                "term_bindings": [ ],
                "constraint_bindings": [ ],
                "terminology_extracts": [ ]
            },
            "original_language": {
                "terminology_id": {
                    "value": "ISO_639-1"
                },
                "code_string": "en"
            },
            "is_controlled": false,
            "uid": null,
            "archetype_id": {
                "value": "openEHR-EHR-EVALUATION.alert-zn.v1"
            },
            "adl_version": "1.5",
            "parent_archetype_id": {
                "value": "openEHR-EHR-EVALUATION.alert.v1"
            },
            "is_template": false,
            "is_overlay": false
        }

    }
}