import Service from './Service';
import bcrypt from 'bcrypt';

class UserService extends Service {
    constructor(model) {
        super(model);
    }

    async getAll(query) {
        let { skip, limit } = query;

        skip = skip ? Number(skip) : 0;
        limit = limit ? Number(limit) : 10;

        delete query.skip;
        delete query.limit;

        if (query._id) {
            try {
                query._id = new mongoose.mongo.ObjectId(query._id);
            } catch (error) {
                console.log('not able to generate mongoose id with content', query._id);
            }
        }

        try {
            let items = await this.model
                .find(query)
                .skip(skip)
                .limit(limit)
                .populate('city');
            let total = await this.model.count();

            return {
                error: false,
                statusCode: 200,
                data: items,
                total
            };
        } catch (errors) {
            return {
                error: true,
                statusCode: 500,
                errors
            };
        }
    }

    async createUser(data) {
        try {
            let user = await this.model.create(data);
            if (user) {
                return { error: false, user };
            }

        } catch (error) {
            console.log('error', error);
            return {
                error: true,
                statusCode: 500,
                message: error.errmsg || 'Not able to create user',
                errors: error.errors
            };
        }
    }

    async authenticate(email, password) {

        try {
            let user = await this.model.findOne({ 'email': email });
            if (!user) {
                return {
                    error: true,
                    statusCode: 404,
                    message: 'user not found.'
                };
            }

            if (! await user.comparePassword(password)) {
                return {
                    error: true,
                    statusCode: 401,
                    message: 'incorrect password.'
                };
            }
            if (user) {
                return { error: false, user, token: user.generateToken() };
            }

        } catch (error) {
            console.log('error', error);
            return {
                error: true,
                statusCode: 500,
                message: error.errmsg || 'Not able to authenticate user',
                errors: error.errors
            };
        }
    }
}

export default UserService;