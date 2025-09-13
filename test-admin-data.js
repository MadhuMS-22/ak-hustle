const mongoose = require('mongoose');
require('dotenv').config();

// Import the Team model
const Team = require('./backend/models/Team');

const testAdminData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hustel');
        console.log('✅ Connected to MongoDB');

        // Get all teams
        const teams = await Team.find({});
        console.log(`\n📊 Total teams in database: ${teams.length}`);

        // Count by status
        const statusCounts = {
            Registered: teams.filter(t => t.competitionStatus === 'Registered').length,
            Round1: teams.filter(t => t.competitionStatus === 'Round1').length,
            Round2: teams.filter(t => t.competitionStatus === 'Round2').length,
            Round3: teams.filter(t => t.competitionStatus === 'Round3').length,
            Eliminated: teams.filter(t => t.competitionStatus === 'Eliminated').length,
            Selected: teams.filter(t => t.competitionStatus === 'Selected').length
        };

        console.log('\n📈 Team Status Breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} teams`);
        });

        // Show team details
        console.log('\n👥 Team Details:');
        teams.forEach((team, index) => {
            console.log(`${index + 1}. ${team.teamName} - ${team.competitionStatus} (Results Announced: ${team.resultsAnnounced})`);
        });

        // Test the admin API endpoint data structure
        const adminData = {
            teams: teams,
            stats: {
                totalTeams: teams.length,
                registered: statusCounts.Registered,
                round1: statusCounts.Round1,
                round2: statusCounts.Round2,
                round3: statusCounts.Round3,
                eliminated: statusCounts.Eliminated,
                selected: statusCounts.Selected,
                hasCompletedCycle: teams.filter(t => t.hasCompletedCycle).length,
                resultsAnnounced: teams.filter(t => t.resultsAnnounced).length
            }
        };

        console.log('\n🔧 Admin API Data Structure:');
        console.log(JSON.stringify(adminData.stats, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

testAdminData();
