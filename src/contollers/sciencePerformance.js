const SciencePerformanceDB = require("../db-models/SciencePerformance")
const GroupDB = require("../db-models/Group")
const AcademicPerformanceDB = require("../db-models/AcademicPerformance")
const errorHandler = require('../utils/error-handler')
const SciencePerformanceDto = require("../models/SciencePerformance");

module.exports.createSciencePerformance = async (req, res) => {
    try {
        const foundSciencePerformances = await SciencePerformanceDB.find({
            scienceId: req.body.scienceId,
            groupId: req.body.groupId,
        })
        if (foundSciencePerformances.length) {
            res.status(409).json({
                message: 'Такой предмет уже существует!'
            });
            return;
        }

        const sciencePerformance = new SciencePerformanceDB({
            scienceId: req.body.scienceId,
            groupId: req.body.groupId,
        });

        await sciencePerformance.save();
        const sciencePerformanceDto = await SciencePerformanceDto.toDto(sciencePerformance)

        res.status(201).json(sciencePerformanceDto);
    } catch (e) {
        errorHandler(res, e);
    }
}

module.exports.removeSciencePerformance = async (req, res) => {
    try {
        const sciencePerformance = await SciencePerformanceDB.findById(req.params.id);
        const targetGroup = await GroupDB.findById(sciencePerformance.groupId);

        await GroupDB.findByIdAndUpdate(sciencePerformance.groupId, {
            sciencePerformances: targetGroup.sciencePerformances.filter((itemId) => itemId !== req.params.id)
        })

        for(let i = 0; i < sciencePerformance.academicPerformances.length; i++) {
            const itemId = sciencePerformance.academicPerformances[i];
            await AcademicPerformanceDB.findByIdAndRemove(itemId);
        }

        await SciencePerformanceDB.findByIdAndRemove(req.params.id);

        res.status(200).json();
    } catch (e) {
        errorHandler(res, e);
    }
}