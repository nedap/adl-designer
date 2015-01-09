package org.openehr.designer.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.openehr.am.AmObject;
import org.openehr.jaxb.am.ArchetypeOntology;
import org.openehr.jaxb.rm.AuthoredResource;
import org.openehr.rm.RmObject;

/**
 * @author Marko Pipan
 */
public class AmMixinModule extends SimpleModule {

    @Override
    public void setupModule(SetupContext context) {
        context.setMixInAnnotations(AmObject.class, AmObjectMixin.class);
        context.setMixInAnnotations(RmObject.class, AmObjectMixin.class);
        context.setMixInAnnotations(ArchetypeOntology.class, ArchetypeOntologyMixin.class);
        context.setMixInAnnotations(AuthoredResource.class, AuthoredResourceMixin.class);
        super.setupModule(context);
    }
}
