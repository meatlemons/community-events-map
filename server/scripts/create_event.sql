    INSERT INTO events (
        EventTitle, 
        StartDateTime, 
        ExpiryDateTime, 
        `Description`,
        ContactEmail,
        ContactTelephone,
        GeoLocation,
        Tags
    ) 
    VALUES (
		"First Event",
        NOW(),
        NOW(),
        "Some description",
        "email@email.com",
        "+447123456789",
		POINT(51.9617, 1.3513),
        '["none", "none2"]'
    )