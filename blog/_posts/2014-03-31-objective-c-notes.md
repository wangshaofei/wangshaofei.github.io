---
layout: post
title: "The language Objective-C notes"
description: "Just some language objective-C notes"
tags: [ objective-C ]
category: Other
---
{% include JB/setup %}

###calling method

    [object method];
    [object methodWithInput:input];
    output = [object method];

### define var

    id myObj = [NSString string];
    // pointer type var
    NSString* myStr = [NSString string]; 

###Nested Msg

    [NSString Func1: [Func2]]
    
### multiple method

    - (BOOL) writeFile:(NSString*)path atomically:(BOOL)useXFile;
    BOOL ret = [myData writeFile:@"path" atomically:@"file"];
    
### accessors (getter/setter)

    [Phone setCaption:@"pNmae"];
    output = [Phone caption]; // leave out get prefix

    // we can use dot syntax since oc 2.0 (only for setter and getter)
    Phone.caption = @"pName";
    output = Phone.caption

### create obj

    // automatic style, created an AutoReleased object
    NSString* myStr = [NSString string];

    // munual style , should release it later
    NSString* myStr = [[NSString alloc] init];

    // use another init which takes input
    NSNumber* myNum = [[NSNumber alloc] initWithFloat:1.0];
    
### memory management

    //str1 should be released automatically
    NSString* str1 = [NSString string];

    // must release str2 when done
    NSString* str2 = [[NSString alloc] init];
    [str2 release];

#### (1) setter
In most cases, the **setter** for an instance variable should just **autorelease** the old object, and **retain** the new one. You then just **make sure to release it in dealloc** as well:

    - (void) setTotalAmount: (NSNumber*)input
    {
        [totalAmount autorelease];
        totalAmount = [input retain];
    }

    - (void) dealloc
    {
        [totalAmount release];
        [super dealloc];
    }

#### (2) alloc
the only real work is managing local references inside a function. And there's only one rule: if you create an object with **alloc** or **copy**, send it a **release or autorelease** message at the end of the function. If you create an object any other way, do nothing. 

    NSNumber* value1 = [[NSNumber alloc] initWithFloat:8.75];
    NSNumber* value2 = [NSNumber numberWithFloat:14.78];

    // only release value1, not value2
    [value1 release];

### Design Class
#### (1) Class Interface

`phone.h` code :

    #import <Cocoa/Cocoa.h>
    @interface Phone : NSObjet {
        NSString* str1
        NSString* str2
    }
    // getter
    // single dash means that it's a instance method , plus means class method
    - (NSString*) str1
    - (NSString*) str2

    // settter
    - (void) setStr1: (NSString*)input;
    - (void) setStr2: (NSString*)input;

    @end

#### (2) Class Implement

`phone.m` code:

    #import "Phone.h"
    @implementation Phone 

    // getter
    - (NSString*) str1 {
        return str1 ;
    }
    - (NSString*) str2 {
        return str2 ;
    }

    //setter
    - (void) setStr1: (NSString*)input {
        [str1 autorelease] ;
        str1 = [input retain];
    }
    - (void) setStr2: (NSString*)input {
        [str2 autorelease] ;
        str2 = [input retain];
        // in garbage collection environment we can set value directly
        // str2 = input ;
    }

    @end

### init

    - (id) init {
        if (self = [super init]){
            [self setStr1:@"string 1"];
            [self setStr2:@"string 2"];
        }
        return self;
    }

### dealloc   

    - (void) dealloc {
        [str1 release]  ;
        [str2 release]  ;
        [super dealloc]  ;
    }

### log

    NSLog ( @"The current date and time is: %@", [NSDate date] );

### properties

Properties are a feature in Objective-C that allow us to automatically generate accessors.

`old code` code:

    #import <Cocoa/Cocoa.h>

    @interface Photo : NSObject {
        NSString* caption;
        NSString* photographer;
    }
    - (NSString*) caption;
    - (NSString*) photographer;

    - (void) setCaption: (NSString*)input;
    - (void) setPhotographer: (NSString*)input;
    @end

`new code` code:

    #import <Cocoa/Cocoa.h>

    @interface Photo : NSObject {
        NSString* caption;
        NSString* photographer;
    }
    // the setter shoudld retain the input value
    @property (retain) NSString* caption;
    @property (retain) NSString* photographer;

    @end

and then, the implementation code:

    #import "Photo.h"
            
    @implementation Photo

    // pay attention AutoGenerate setter and getter
    @synthesize caption;
    @synthesize photographer;

    - (void) dealloc
    {
        [caption release];
        [photographer release];
        [super dealloc];
    }

    @end

### Nil

You can call methods on nil without crashing or throwing an exception. you usually don't need to check for nil before calling a method on an object.If you call a method on nil that returns an object, you will get nil as a return value. 

Use Nil to improve our dealloc method slightly:

    - (void) dealloc
    {
        // setter just retain nil (which does nothing) and release old value 
        self.caption = nil;
        self.photographer = nil;
        [super dealloc];
    }

### categories

a category allows you to add methods to an existing class without subclassing it or needing to know any of the details of how it's implemented. (like prototype extension in JS?)

code like this:

    #import <Cocoa/Cocoa.h>
                
    @interface NSString (Utilities)
    - (BOOL) isURL;
    @end
    
            
implement code:

    #import "NSString-Utilities.h"
    
    @implementation NSString (Utilities)

    - (BOOL) isURL
    {
        if ( [self hasPrefix:@"http://"] )
            return YES;
        else
            return NO;
    }

    @end
    
use it:

    NSString* string1 = @"http://pixar.com/";
    NSString* string2 = @"Pixar";

    if ( [string1 isURL] )
        NSLog (@"string1 is a URL");

    if ( [string2 isURL] )
        NSLog (@"string2 is a URL"); 
