﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System.Diagnostics.CodeAnalysis;
using System.Xml.Serialization;

// 
// This source code was auto-generated by xsd, Version=4.7.3081.0.
// 


/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.7.3081.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(AnonymousType=true, Namespace="http://www.sitemaps.org/schemas/sitemap/0.9")]
[System.Xml.Serialization.XmlRootAttribute(Namespace="http://www.sitemaps.org/schemas/sitemap/0.9", IsNullable=false)]
[ExcludeFromCodeCoverage]
#pragma warning disable CS8981
public partial class urlset {
    
    private System.Xml.XmlElement[] anyField;
    
    private tUrl[] urlField;
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAnyElementAttribute()]
    public System.Xml.XmlElement[] Any {
        get {
            return this.anyField;
        }
        set {
            this.anyField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute("url")]
    public tUrl[] url {
        get {
            return this.urlField;
        }
        set {
            this.urlField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.7.3081.0")]
[System.SerializableAttribute()]
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.ComponentModel.DesignerCategoryAttribute("code")]
[System.Xml.Serialization.XmlTypeAttribute(Namespace="http://www.sitemaps.org/schemas/sitemap/0.9")]
[ExcludeFromCodeCoverage]
public partial class tUrl {
    
    private string locField;
    
    private string lastmodField;
    
    private tChangeFreq changefreqField;
    
    private bool changefreqFieldSpecified;
    
    private decimal priorityField;
    
    private bool priorityFieldSpecified;
    
    private System.Xml.XmlElement[] anyField;
    
    /// <remarks/>
    [System.Xml.Serialization.XmlElementAttribute(DataType="anyURI")]
    public string loc {
        get {
            return this.locField;
        }
        set {
            this.locField = value;
        }
    }
    
    /// <remarks/>
    public string lastmod {
        get {
            return this.lastmodField;
        }
        set {
            this.lastmodField = value;
        }
    }
    
    /// <remarks/>
    public tChangeFreq changefreq {
        get {
            return this.changefreqField;
        }
        set {
            this.changefreqField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlIgnoreAttribute()]
    public bool changefreqSpecified {
        get {
            return this.changefreqFieldSpecified;
        }
        set {
            this.changefreqFieldSpecified = value;
        }
    }
    
    /// <remarks/>
    public decimal priority {
        get {
            return this.priorityField;
        }
        set {
            this.priorityField = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlIgnoreAttribute()]
    public bool prioritySpecified {
        get {
            return this.priorityFieldSpecified;
        }
        set {
            this.priorityFieldSpecified = value;
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlAnyElementAttribute()]
    public System.Xml.XmlElement[] Any {
        get {
            return this.anyField;
        }
        set {
            this.anyField = value;
        }
    }
}

/// <remarks/>
[System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.7.3081.0")]
[System.SerializableAttribute()]
[System.Xml.Serialization.XmlTypeAttribute(Namespace="http://www.sitemaps.org/schemas/sitemap/0.9")]
public enum tChangeFreq {
    
    /// <remarks/>
    always,
    
    /// <remarks/>
    hourly,
    
    /// <remarks/>
    daily,
    
    /// <remarks/>
    weekly,
    
    /// <remarks/>
    monthly,
    
    /// <remarks/>
    yearly,
    
    /// <remarks/>
    never,
}
#pragma warning restore CS8981