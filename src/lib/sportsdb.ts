// TheSportsDB API integration for teams and players
// Free API: https://www.thesportsdb.com/api.php

export interface Team {
    id: string;
    name: string;
    sport: string;
    league: string;
    badge?: string;
    country?: string;
}

export interface Player {
    id: string;
    name: string;
    team?: string;
    sport: string;
    position?: string;
    nationality?: string;
    thumbnail?: string;
}

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

// Search teams by name
export async function searchTeams(query: string): Promise<Team[]> {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${BASE_URL}/searchteams.php?t=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.teams) return [];

        return data.teams.map((team: any) => ({
            id: team.idTeam,
            name: team.strTeam,
            sport: team.strSport,
            league: team.strLeague || "Unknown",
            badge: team.strBadge,
            country: team.strCountry,
        }));
    } catch (error) {
        console.error("Error searching teams:", error);
        return [];
    }
}

// Search players by name
export async function searchPlayers(query: string): Promise<Player[]> {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${BASE_URL}/searchplayers.php?p=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.player) return [];

        return data.player.slice(0, 20).map((player: any) => ({
            id: player.idPlayer,
            name: player.strPlayer,
            team: player.strTeam,
            sport: player.strSport,
            position: player.strPosition,
            nationality: player.strNationality,
            thumbnail: player.strThumb || player.strCutout,
        }));
    } catch (error) {
        console.error("Error searching players:", error);
        return [];
    }
}

// Get teams by league
export async function getTeamsByLeague(leagueId: string): Promise<Team[]> {
    try {
        const response = await fetch(`${BASE_URL}/lookup_all_teams.php?id=${leagueId}`);
        const data = await response.json();

        if (!data.teams) return [];

        return data.teams.map((team: any) => ({
            id: team.idTeam,
            name: team.strTeam,
            sport: team.strSport,
            league: team.strLeague,
            badge: team.strBadge,
            country: team.strCountry,
        }));
    } catch (error) {
        console.error("Error fetching teams by league:", error);
        return [];
    }
}

// League IDs for popular leagues
export const LEAGUE_IDS: Record<string, string> = {
    epl: "4328",      // English Premier League
    laliga: "4335",   // Spanish La Liga
    seriea: "4332",   // Italian Serie A
    bundesliga: "4331", // German Bundesliga
    ligue1: "4334",   // French Ligue 1
    nba: "4387",      // NBA
    nfl: "4391",      // NFL
    mlb: "4424",      // MLB
    nhl: "4380",      // NHL
    ufc: "4443",      // UFC
};

// Get popular teams from major leagues (for initial display)
export async function getPopularTeams(): Promise<Team[]> {
    const popularLeagues = ["4328", "4335", "4387"]; // EPL, La Liga, NBA

    try {
        const results = await Promise.all(
            popularLeagues.map(id => getTeamsByLeague(id))
        );

        // Flatten and take top teams from each
        return results.flatMap(teams => teams.slice(0, 6));
    } catch (error) {
        console.error("Error fetching popular teams:", error);
        return [];
    }
}
