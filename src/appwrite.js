import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client);

// Saving user searches ( or queries ) and it's counts
export const updateSearchCount = async (searchTerm, movie) => {
    
    // console checks
    console.log("Attempting to update search count for:", searchTerm, "Movie:", movie?.title);
    console.log("Appwrite Config:", { PROJECT_ID, DATABASE_ID, COLLECTION_ID });

    // 1. use Appwrite SDK to check if the search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ]);

        // 2. If it does, update the count
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            });

        // 3. If it doesn't, create a new document with the search term and count 1    
        } else {
            await database.createDocument(
                DATABASE_ID,    // Parameter 1: Database ID
                COLLECTION_ID,  // Parameter 2: Collection ID
                ID.unique(),    // Parameter 3: Document ID
                {               // Parameter 4: The data object for the document
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }
            );
        }

    } catch (error) {
    console.error(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ]);

        return result.documents;      
    } catch (error) {
        console.error(error);
    }
}