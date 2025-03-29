process.env.TZ = 'America/New_York';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error_handler');
const initWebSocketServer = require('./socket/main_socket');
const helmet = require('helmet');
const {runAppointmentsStatusChecker} = require('./cron/allAppointmentStatusChecker');
const {processElligibleFundTransfers} = require('./cron/transferToProvider');
const {runProviderBadgeEligibilityCron} = require('./cron/providerBadgeEligibilityCron');
const {googlePassport,facebookPassport} = require('./config/passport');

const authRoute = require('./routes/auth_route');
const providerRoute = require('./routes/provider_route');
const adminRoute = require('./routes/admin_route');
const clientRoute = require('./routes/client_route');
const dropdownsRoute = require('./routes/dropdown_route');
const appointmentsRoute = require('./routes/appointment_route');
const performanceRoute = require('./routes/performance_route');
const locationsRoute = require('./routes/location_route');
const reviewRoute = require('./routes/review_route');
const paymentRoute = require('./routes/payment_route');
const notificationRoute = require('./routes/notification_route');
const stripeWebhookRoute = require('./routes/stripe_webhook_route');
const stripeIdentityRoute = require('./routes/stripe_indentity_route');
const intakeRoute = require('./routes/intake_route');
const meetingLinkRoute = require('./routes/meeting_link_route');
const app = express();

app.use('/webhook/v1/stripe', bodyParser.raw({ type: 'application/json' }));
app.use('/webhook/v1/stripe', stripeWebhookRoute); // Webhook route


app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Parse the allowed origins from the .env file
const allowedOrigins = process.env.CLIENT_URL.split(',');
app.use(cors({
	origin: (origin, callback) => {
		// Allow requests without origin (like from mobile apps or curl)
		if (!origin) return callback(null, true);

		// Check if the request's origin is in the allowed origins array
		if (allowedOrigins.includes(origin)) {
		callback(null, true); // Allow the request
		} else {
		callback(new Error('Not allowed by CORS')); // Reject the request
		}
	},
	credentials: true, // Allow credentials like cookies or authorization headers
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
	allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
	preflightContinue: false,
	optionsSuccessStatus: 204
}));

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
		callback(null, true);
		} else {
		callback(new Error('CORS not allowed for this origin'));
		}
	},
	credentials: true
}));

app.use(morgan('dev'));
app.use(helmet());
app.use(cookieParser());
app.use(googlePassport.initialize());
app.use(facebookPassport.initialize());
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/providers', providerRoute);
app.use('/api/v1/clients', clientRoute);
app.use('/api/v1/dropdowns', dropdownsRoute);
app.use('/api/v1/appointments', appointmentsRoute);
app.use('/api/v1/performance', performanceRoute);
app.use('/api/v1/locations', locationsRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/notifications', notificationRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/stripe', stripeIdentityRoute);
app.use('/api/v1/intake', intakeRoute);
app.use('/api/v1/meeting-link', meetingLinkRoute);

// Error handler middleware
app.use(errorHandler);


const PORT = process.env.PORT;

// if(process.env.NODE_ENV === 'development'){
// 	console.log = function(){}; // Disabling console.log in development mode
// }

// Had to store the server object in a variable to use it for WebSocket upgrade
const server = app.listen(PORT, () => {
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// log time every 10 seconds 
// setInterval(() => {
// 	console.log("Machine time: ", new Date());
// 	console.log("Machine time to locale string: ", new Date().toLocaleString());
// }, 10000);


// run the cron job
runAppointmentsStatusChecker();
processElligibleFundTransfers();
runProviderBadgeEligibilityCron();