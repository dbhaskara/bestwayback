# This file populates  our Firebase database with government-reported violent crime data.
# The Python script removes incomplete and unnecessary data and sorts the data by longitude 
# value for optimal calculations in the .js file


import json
from pprint import pprint
import pyrebase

#Configure the firebase connection
config = {
    'apiKey': "AIzaSyBhwIqzdAMMzEPOciWo3RnWIV1mDkSCTSI",
    'authDomain': "best-way-back.firebaseapp.com",
    'databaseURL': "https://best-way-back.firebaseio.com",
    'projectId': "best-way-back",
    'storageBucket': "best-way-back.appspot.com",
  };
firebase = pyrebase.initialize_app(config)
db = firebase.database()

#Print contents of database
#users = db.child("users").get()
#pprint(users.val())

#Add each json item to the database
with open('crimes.json') as data_file:    
    data = json.load(data_file)

count = 0
loc_data = []
#remove all data points without locations
for d in data:
	if ('location' in d.keys()):
		loc_data.append(d)
		count += 1

#Sort the data on the longitudinal value of the location
loc_data = sorted(loc_data, key=lambda k: k['location']['latitude'])

print('Adding ' + str(count) + ' crime incidents to database...')


for crime in loc_data:

		entry = {'date': crime['date'], 
			'primary_type': crime['primary_type'], 
			'arrest': crime['arrest'],
			'year': crime['year'],
			'description': crime['description'],
			'district': crime['district'],
			'longitude': crime['location']['longitude'], 
			'latitude': crime['location']['latitude']
			}

		db.child("crimes").push(entry)
		

print('Added!')
	


