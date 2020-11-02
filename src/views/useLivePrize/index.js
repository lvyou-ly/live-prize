import PrizeLive from '@/components/LivePrize.vue';
export default {
    data () {
        return {
            iconList: [
                require('./image/prize01.jpg'),
                require('./image/prize02.jpg'),
                require('./image/prize03.jpeg'),
                require('./image/prize04.jpeg'),
                require('./image/prize05.jpg'),
                require('./image/prize06.jpg'),
            ],
            activeIcon: 2,
        }
    },
    components: {
        PrizeLive,
    },
}