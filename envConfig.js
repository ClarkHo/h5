/**
 * Created by huangkemin on 2017/11/1.
 */
/**
 * 项目配置
 * @type {{oupu: {companyId: number, dev: {domain: string, ip: string}}, hhb2c: {companyId: number, dev: {domain: string, ip: string}}}}
 */
var config={
    //欧普
    oupu:{
        companyId:51,
            dev:{
                domain:"m.dev.op.com",
                ip:"192.168.20.176"
            },
            test:{
                domain:"m.test.op.com",
                ip:"192.168.9.230"
            },
            stg:{
                domain:"stg.m.eopple.com",
                ip:"120.92.132.132"
            },
            online:{
                domain:"m.opplestore.com",
                ip:"120.92.142.134"
            }

    },
    //海航b2c
    hhb2c:{
        companyId:54,
        dev:{
            domain:"m.dev.hhb2c.com",
            ip:"192.168.20.176"
        }
    },
    //宜和
    yihe:{
        companyId:1,
        dev:{
            domain:"m.dev.yh.com",
            ip:"192.168.20.176"
        },
        test:{
            domain:"m.test.yh.com",
            ip:"192.168.9.230"
        },
        online:{
            domain:"tm.mediashops.cn",
            ip:"123.207.61.35"
        }
    },
    //saas
    saas:{
        companyId:10,
        dev:{
            domain:"m.dev.op.com",
            ip:"192.168.20.176"
        }
    },
    jd:{
        companyId:51,
        dev:{
            domain:"m.dev.op.com",
            ip:"192.168.20.176"
        },
        test:{
            domain:"m.test.op.com",
            ip:"192.168.9.230"
        },
        stg:{
            domain:"m.dev.op.com",
            ip:"192.168.20.176"
        },
        online:{
            domain:"m.dev.op.com",
            ip:"192.168.20.176"
        }
    }
}


module.exports=config;