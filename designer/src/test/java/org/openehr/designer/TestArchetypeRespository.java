package org.openehr.designer;

import org.openehr.designer.ArchetypeRepository;
import org.openehr.designer.ArchetypeRepositoryImpl;

import java.io.IOException;

/**
 * @author Marko Pipan
 */
public class TestArchetypeRespository {
    private static ArchetypeRepositoryImpl archetypeRepository;

    public static synchronized ArchetypeRepository getInstance() {
        if (archetypeRepository == null) {
            try {
                ArchetypeRepositoryImpl repo = new ArchetypeRepositoryImpl();
                repo.setRepositoryLocation("c:/projects/openehr/Adl Workbench repositories/adl-archetypes/Reference/CKM_2013_12_09");
                repo.init();
                archetypeRepository = repo;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return archetypeRepository;

    }
}
