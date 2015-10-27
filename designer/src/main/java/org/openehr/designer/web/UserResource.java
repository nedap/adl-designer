package org.openehr.designer.web;

import org.springframework.ui.ModelMap;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpSession;

/**
 * Created by Denko on 10/27/2015.
 */
public interface UserResource {
    ModelAndView displayTemplateEditor(HttpSession session);
}
