import { useRouter } from "vue-router";

export function usePollNavigation() {
    const router = useRouter()

    const viewPollDetail = (pollId) => {
        const user = JSON.parse(localStorage.getItem('user'))
        const userId = user ? user.userId : null
        router.push({
            name: 'PollDetail',
            params: {
                pollId: pollId
            },
            query: {
                userId: userId
            }
        })
    }

    return {
        viewPollDetail
    }
}