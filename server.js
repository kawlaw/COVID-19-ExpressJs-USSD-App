const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Initialize App
const app = express();

// Initialize DB
const db = require('./config/keys').MongoURI;

// Load Models
const Report = require('./models/report');
const Request = require('./models/request');

// Load Dummy Symptoms Data
const Symptoms = require('./data/symptoms');

// Connect to Mongo
mongoose
	.connect(db, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('MongoDB Connected....'))
	.catch(() => res.send('END Application Down').console.log(err));

app.get('/', async (req, res) => {
	const { msisdn, service_code } = req.query;
	let { ussd_text } = req.query;

	const ussd_send = (response) => {
		return res.end(`CON ${response}`, 200);
	};

	const ussd_end = (response) => {
		return res.send(`END ${response}`, 444);
	};

	let level = 0;
	let response = '';

	if (ussd_text != '') {
		ussd_text = ussd_text.replace('#', '*');
		ussd_string_split = ussd_text.split('*');
		level = ussd_string_split.length;
	}

	if (level == 0) {
		response =
			'Welcome to COVID-19 Uganda Portal\n\n' +
			'1. Report Case\n' +
			'2. Request Test\n' +
			'3. Total Cases in Uganda\n' +
			'4. Global Results\n' +
			'5. COVID-19 Signs\n' +
			'6. Testing Centers\n' +
			'7. Toll Free Helplines\n' +
			'0. Exit';

		ussd_send(response);
	}

	if (level > 0) {
		// Cases as Main Menu Options

		switch (ussd_string_split[0]) {
			case '1':
				// Report Case

				if (ussd_string_split.length == 1) {
					response = 'Please enter your location (District/Town)\n\n';

					ussd_send(response);
				} else if (ussd_string_split.length == 2 && ussd_string_split[1]) {
					response = 'Please enter full name of suspect\n\n';

					ussd_send(response);
				} else if (
					ussd_string_split.length == 3 &&
					ussd_string_split[1] &&
					ussd_string_split[2]
				) {
					response = "Please enter suspect's phone number\n\n";

					ussd_send(response);
				} else if (
					ussd_string_split.length == 4 &&
					ussd_string_split[1] &&
					ussd_string_split[2] &&
					ussd_string_split[3]
				) {
					response =
						'Please enter your National Identification Number (NIN)\n\n';

					ussd_send(response);
				} else if (
					ussd_string_split.length == 5 &&
					ussd_string_split[1] &&
					ussd_string_split[2] &&
					ussd_string_split[3] &&
					ussd_string_split[4]
				) {
					// Save Details to Database
					try {
						newReport = new Report({
							fullName: ussd_string_split[2],
							contact_details: {
								district: ussd_string_split[1],
								nextOfKinPhoneNumber: parseInt(ussd_string_split[3]),
								NIN: ussd_string_split[4],
								MSISDN: parseInt(msisdn),
							},
							reportReference: uuidv4(),
						});

						const savedReport = await newReport.save();

						response = `Application saved! Your referrence number is ${savedReport.reportReference}`;

						ussd_end(response);
					} catch (err) {
						// Log error in case of any
						console.log(err);

						response = `Your report could not be saved. Please try again...`;

						ussd_end(response);
					}
				}

				break;

			case '2':
				// Request Test
				if (ussd_string_split.length == 1) {
					response = 'Please enter your location (District/Town)\n\n';

					ussd_send(response);
				} else if (ussd_string_split.length == 2 && ussd_string_split[1]) {
					response = 'Please enter your full name\n\n';

					ussd_send(response);
				} else if (
					ussd_string_split.length == 3 &&
					ussd_string_split[1] &&
					ussd_string_split[2]
				) {
					response = 'Please enter alternate phone number\n\n';

					ussd_send(response);
				} else if (
					ussd_string_split.length == 4 &&
					ussd_string_split[1] &&
					ussd_string_split[2] &&
					ussd_string_split[3]
				) {
					response =
						'Please enter your National Identification Number (NIN)\n\n';

					ussd_send(response);
				} else if (
					ussd_string_split.length == 5 &&
					ussd_string_split[1] &&
					ussd_string_split[2] &&
					ussd_string_split[3] &&
					ussd_string_split[4]
				) {
					// Save Details to Database
					try {
						newRequest = new Request({
							fullName: ussd_string_split[2],
							contact_details: {
								district: ussd_string_split[1],
								nextOfKinPhoneNumber: ussd_string_split[3],
								NIN: ussd_string_split[4],
							},
							requestReference: uuidv4(),
						});

						const savedRequest = await newRequest.save();

						response = `Request saved! Your referrence number is ${savedRequest.requestReference}`;

						ussd_end(response);
					} catch (err) {
						// Log the error
						console.log(err);

						response = `Your request could not be saved. Please try again...`;

						ussd_end(response);
					}
				}

				break;

			case '3':
				// Country Results
				if (ussd_string_split.length == 1) {
					await axios
						.get('https://api.covid19api.com/total/dayone/country/uganda')
						.then((res) => {
							const { Confirmed, Deaths, Recovered, Active } = res.data.pop();

							response = `Current Results:\n\nCases: ${Confirmed}\nDeaths: ${Deaths}\nRecoveries: ${Recovered}\nActive: ${Active}`;

							ussd_end(response);
						})
						.catch((err) => {
							response = 'Failed to fetch data. Please try again...';
							ussd_end(response);
						});
				}

				break;

			case '4':
				// Global Results
				if (ussd_string_split.length == 1) {
					await axios
						.get('https://api.covid19api.com/world/total')
						.then((res) => {
							const { TotalConfirmed, TotalDeaths, TotalRecovered } = res.data;

							const totalActiveCases =
								TotalConfirmed - (TotalDeaths + TotalRecovered);

							response = `Global Statistics:\n\nTotal Confirmed: ${TotalConfirmed}\nTotal Deaths: ${TotalDeaths}\nTotal Recoveries: ${TotalRecovered}\nActive: ${totalActiveCases}`;

							ussd_end(response);
						})
						.catch((err) => {
							response = 'Failed to fetch data. Please try again...';
							ussd_end(response);
						});
				}

				break;

			case '5':
				// COVID-19 Symptoms
				if (ussd_string_split.length == 1) {
					response =
						'Check COVID-19 Symptoms\n\n' +
						'1. Most Common Symptoms\n' +
						'2. Less Common Symptoms\n' +
						'3. Serious Symptoms\n';

					ussd_send(response);
				} else if (ussd_string_split.length == 2 && ussd_string_split[1] == 1) {
					// Return Most Common Symptoms
					response = `The most common symptoms of COVID-19 are ${Symptoms.mostCommon}`;
					ussd_end(response);
				} else if (ussd_string_split.length == 2 && ussd_string_split[1] == 2) {
					// Return Less Common Symptoms
					response = `The less common symptoms of COVID-19 are ${Symptoms.lessCommon}`;
					ussd_end(response);
				} else if (ussd_string_split.length == 2 && ussd_string_split[1] == 3) {
					// Return Serrious Symptoms
					response = `The serious symptoms of COVID-19 are ${Symptoms.seriousSymptoms}`;
					ussd_end(response);
				}

				break;

			case '6':
				//Testing Centers
				if (ussd_string_split.length == 1) {
					const testingCenters = require('./data/testingCenters')
						.testingCenters;

					response = `Top Kampala COVID-19 Testing Centers\n\n${testingCenters}`;

					ussd_end(response);
				}

				break;

			case '7':
				// Government Toll Free Helplines
				if (ussd_string_split.length == 1) {
					const hotLines = require('./data/helplines').tollFreeHotlines;

					response = `Uganda COVID-19 Tollfree Hotlines\n\n${hotLines}`;

					ussd_end(response);
				}

				break;

			case '0':
				response = 'Thank you for using our service.';

				ussd_end(response);

				break;

			default:
				response = 'Invalid Input. Please try again.';

				ussd_end(response);

				break;
		}
	}
});

const PORT = require('./config/keys').PORT;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
