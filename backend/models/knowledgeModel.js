import { Knowledge } from './Knowledge.js';
import mongoose from 'mongoose';

export const KnowledgeModel = {
    async upsert(section, data, updatedBy = 'system') {
        if (!section || typeof section !== 'string' || section.trim().length === 0) {
            throw new Error('Section must be a non-empty string');
        }

        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            throw new Error('Data must be a non-empty object');
        }

        return await Knowledge.findOneAndUpdate(
            { section },
            {
                section,
                data,
                lastUpdatedBy: updatedBy,
                updatedAt: new Date()
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );
    },

    async getAll() {
        return await Knowledge.find({}).sort({ section: 1 });
    },

    async getBySection(section) {
        if (!section || typeof section !== 'string' || section.trim().length === 0) {
            throw new Error('Section must be a non-empty string');
        }
        return await Knowledge.findOne({ section });
    },

    async search(query) {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return [];
        }

        return await Knowledge.find({
            $text: { $search: query.trim() }
        }, {
            score: { $meta: 'textScore' }
        }).sort({ score: { $meta: 'textScore' } });
    },

    async delete(section) {
        if (!section || typeof section !== 'string' || section.trim().length === 0) {
            throw new Error('Section must be a non-empty string');
        }
        return await Knowledge.deleteOne({ section });
    },

    async deleteAll() {
        return await Knowledge.deleteMany({});
    },

    async count() {
        return await Knowledge.countDocuments();
    },

    async getAsObject() {
        try {
            const docs = await Knowledge.find({});
            const result = {};
            docs.forEach(doc => {
                result[doc.section] = doc.data;
            });
            return result;
        } catch (error) {
            console.error('Error getting knowledge as object:', error);
            return {};
        }
    },

    async bulkUpsert(sections) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const results = [];
            for (const [section, data] of Object.entries(sections)) {
                const result = await this.upsert(section, data);
                results.push(result);
            }

            await session.commitTransaction();
            return results;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
};