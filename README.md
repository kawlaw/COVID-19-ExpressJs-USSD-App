# COVID-19-ExpressJs-USSD-App
Sample COVID-19 ExpressJs USSD App. You'll need to define msisdn, service code and ussd_text in the request query to interact with the app. You can do it like this: http://localhost:7000?msisdn=256773725175&ussd_text=&service_code=*131#.
You can then keep on concatenating options on the ussd_text variable separated by an asterix i.e ussd_text=1[asterix]2[asterix]1 as you follow the prompts.
