package org.openehr.designer.tom;

/**
 * @author Marko Pipan
 */
public class LocalizedNameTom extends AbstractTom {
    private String text;
    private String description;

    public LocalizedNameTom() {
    }

    public LocalizedNameTom(String text, String description) {
        this.text = text;
        this.description = description;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
