package org.openehr.designer;

import java.util.Iterator;

/**
 * @author Marko Pipan
 */
public class WtUtils {
    public static String overrideNodeId(String nodeId) {
        if (nodeId == null) return null;
        return nodeId + ".1";
    }

    public static String parentNodeId(String nodeId) {
        int pos = nodeId.lastIndexOf('.');
        return nodeId.substring(0,pos);
    }

     public static <T> Iterable<T> iterable(Iterator<T> iterator) {
         return () -> iterator;
     }
}
