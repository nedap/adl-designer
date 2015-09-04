# Adl Designer

ADL 2.0 designer (template designer, archetype editor,...)


### Info for users
Adl Designer depends on adl2 parser which can be found at https://github.com/openEHR/adl2-core. As the parser is not yet available as an artifact in maven repostory, you will need to clone and install adl2-core into a local maven repository before building this project.

## Archetype Editor
Part of the designer module, that is capable editing ADL2 archetypes. Can be accessed on the url _/designer/archetype-editor.html_

**Architecture**

![Archetype Editor Architecture](docs/archetype-editor-architecture.png "")

Individual module descriptions:
### Web Interface
The web interface is based on jquery and bootstrap3. Html is generated from templates (templates/\*.hbs) using handlebars. Javascript code resides in _js/archetype-editor/\*_.

### Archetype Object Model
Code for manipulating of Archetype Object Model (AOM). Independent of the web interface. Location: _js/am/\*_. Everything in this module can be accesed though a single global variable: _AOM_.

Some of the supported functionality:

* AOM.ArchetypeModel - Wraps AOM of a single archetype, allowing for easier manipulation. In addition to  functionality such as manipulating terminology, annotations, constraints, translations, bindings, it can also deal with specialized archetypes.
* AOM.NodeId - models a single node id, such as _id1.1.3_.
* AOM.RmPath - models a single rm path, such as _/data[id3]/items[id4]/value_
* AOM.AmQuery - enables searching for cosntraints that match a particular rm path
* AOM.createNewArchetype - Create a new archetype from scratch, with a provided basic structure based on the RM class
* AOM.ReferenceModel - Provides reflection-like functionality for a reference model.

### Reference Model
Contains special handling required for a particular reference model, for example rendering constraint for DV_TEXT. Resides in _js/archetype-editor/module-\*_. Archetype designer currently only supports openEHR reference model, however the code is structured to allow easy addition of new models in the future.

Currently supported reference models:
* module-primitive - support for primitive constraints, such as C_INTEGER and special AOM constrains, such as ARCHETYPE_SLOT.
* module-openehr - support for openEHR reference model

### Archetype Repository
Provides the functionality of an archetype repository, such as listing existing archetypes, load/save archetype. Accessible via REST interface.

### Support
Supporting functionality, such as retrieving supported units.

## Template Editor
Can be accessed on the url _/designer/template-editor.html_.

**Architecture**

![Template Editor Architecture](docs/template-editor-architecture.png "")

Template Editor is built on top of the Archetype Editor. As such, it contains the same functionality (only the Web Interface is mostly rewritten), and has these additions:

### Web Interface
Mostly rewritten for the Template Editor. Javascript code resides in _/js/archetype-editor/template-editor\*_

### Archetype Object Model

* AOM.TemplateModel - Models a single template. Every archetype in the template is included as a specialized ArchetypeModel, so on archetype level it can do everything that Archetype Designer can. Additionaly, it provides functions for adding/removing archetypes from the template.

### Template Repository
Provides functionality of a template repository, such as listing existing templates, load/save template. Accessible via REST interface