package org.openehr.designer;

import org.openehr.jaxb.am.FlatArchetype;
import org.openehr.jaxb.am.ObjectFactory;
import org.openehr.jaxb.am.Template;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.bind.*;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * @author markopi
 * @since 2.2.12
 */
public class TemplateMarshaller {
    private static final Logger LOG = LoggerFactory.getLogger(TemplateMarshaller.class);

    private final JAXBContext context;
    private final ObjectFactory objectFactory;

    public TemplateMarshaller() {
        try {
            this.objectFactory = new ObjectFactory();
            context = JAXBContext.newInstance(Template.class.getPackage().getName());
        } catch (JAXBException e) {
            throw new RuntimeException(e);
        }
    }


    public Template readTemplate(Path in) throws IOException, JAXBException {
        return readTemplate(Files.newInputStream(in));
    }

    public Template readTemplate(InputStream in) throws JAXBException {
        try {
            Unmarshaller unmarshaller = context.createUnmarshaller();
            //noinspection unchecked
            JAXBElement<Template> element = (JAXBElement<Template>) unmarshaller.unmarshal(in);
            return element.getValue();
        } finally {
            try {
                in.close();
            } catch (IOException e) {
                LOG.warn("Error closing input stream", e);
            }
        }
    }

    public Template readTemplate(Reader reader) throws JAXBException {
        try {
            Unmarshaller unmarshaller = context.createUnmarshaller();
            //noinspection unchecked
            JAXBElement<Template> element = (JAXBElement<Template>) unmarshaller.unmarshal(reader);
            return element.getValue();
        } finally {
            try {
                reader.close();
            } catch (IOException e) {
                LOG.warn("Error closing input stream", e);
            }
        }
    }

    public void write(FlatArchetype flatArchetype, Path out) throws JAXBException, IOException {
        writeAmObject(objectFactory.createArchetype(flatArchetype), out);
    }

    private void writeAmObject(JAXBElement<?> template, OutputStream out) throws JAXBException, IOException {
            Marshaller marshaller = context.createMarshaller();
            marshaller.setSchema(null);
            marshaller.setProperty(Marshaller.JAXB_FRAGMENT, true);

            marshaller.marshal(template, out);
            out.flush();
    }

    private void writeAmObject(JAXBElement<?> template, Path out) throws JAXBException, IOException {
        try (OutputStream outputStream = Files.newOutputStream(out)) {
            writeAmObject(template, outputStream);
            outputStream.close();
        } catch (IOException e) {
            try {
                Files.deleteIfExists(out);
            } catch (IOException e1) {
                LOG.warn("Error deleting file " + out.toAbsolutePath() + " after error. You should delete it manually.",
                        e1);
            }
            throw e;
        }
    }


}