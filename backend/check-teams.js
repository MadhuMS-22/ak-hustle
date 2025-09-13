import mongoose from 'mongoose';
import Team from './models/Team.js';

async function checkTeams() {
    try {
        console.log('Connecting to MongoDB...');

        // Connect to MongoDB with shorter timeout
        await mongoose.connect('mongodb://localhost:27017/hustle_competition', {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });

        console.log('Connected to MongoDB');
        console.log('Checking teams in database...');

        const teams = await Team.find({}).limit(10);
        console.log(`Total teams: ${teams.length}`);

        if (teams.length > 0) {
            console.log('\nTeam statuses:');
            teams.forEach(team => {
                console.log(`- ${team.teamName}: ${team.competitionStatus} (Round3 completed: ${team.round3Completed}, Round3 score: ${team.round3Score})`);
            });

            const round3Teams = teams.filter(t => t.competitionStatus === 'Round3' || t.competitionStatus === 'Selected' || t.round3Completed);
            console.log(`\nTeams in Round 3 or completed: ${round3Teams.length}`);
        } else {
            console.log('No teams found in database');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error checking teams:', error);
        process.exit(1);
    }
}

checkTeams();
