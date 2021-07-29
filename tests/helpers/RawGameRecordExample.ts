import { tb } from "../../deps.ts";

import RawGameRecord from "../../src/RawGameRecord.ts";

export default function RawGameRecordExample(): RawGameRecord {
  return tb.JSON.parse(
    RawGameRecord,
    `{"ogs":{"related":{"detail":"/api/v1/games/28073181"},"players":{"black":{"id":630242,"username":"voltrevo","country":"au","icon":"https://b0c2ddc39d13e1c0ddad-93a52a5bc9e7cc06050c1a999beb3694.ssl.cf1.rackcdn.com/9a1a69aebde09170d1e64400a968128c-32.png","ratings":{"version":5,"overall":{"rating":1404.081483288449,"deviation":60.95011430148888,"volatility":0.06002034095093962}},"ranking":22.77358926085324,"professional":false,"ui_class":"supporter"},"white":{"id":496781,"username":"Play like DD","country":"de","icon":"https://b0c2ddc39d13e1c0ddad-93a52a5bc9e7cc06050c1a999beb3694.ssl.cf1.rackcdn.com/6c785dd95e0d2f4af69ce1c5ab030bdd-32.png","ratings":{"version":5,"overall":{"rating":1117.4698581420976,"deviation":61.59307022171643,"volatility":0.06003611074618216}},"ranking":17.48806770555165,"professional":false,"ui_class":""}},"id":28073181,"name":"Friendly Match","creator":630242,"mode":"game","source":"play","black":630242,"white":496781,"width":13,"height":13,"rules":"japanese","ranked":true,"handicap":1,"komi":"0.50","time_control":"byoyomi","black_player_rank":0,"black_player_rating":"0.000","white_player_rank":0,"white_player_rating":"0.000","time_per_move":36,"time_control_parameters":"{\\"system\\": \\"byoyomi\\", \\"time_control\\": \\"byoyomi\\", \\"speed\\": \\"live\\", \\"pause_on_weekends\\": false, \\"main_time\\": 600, \\"period_time\\": 30, \\"periods\\": 4}","disable_analysis":false,"tournament":null,"tournament_round":0,"ladder":null,"pause_on_weekends":false,"outcome":"30.5 points","black_lost":false,"white_lost":true,"annulled":false,"started":"2020-11-05T05:33:32.788630-05:00","ended":"2020-11-05T06:01:39.895464-05:00","sgf_filename":null,"historical_ratings":{"black":{"id":630242,"ratings":{"version":5,"overall":{"rating":1010.8578491210938,"deviation":100.27388000488281,"volatility":0.06000421568751335}},"username":"voltrevo","country":"au","ranking":22.77358926085324,"professional":false,"icon":"https://b0c2ddc39d13e1c0ddad-93a52a5bc9e7cc06050c1a999beb3694.ssl.cf1.rackcdn.com/9a1a69aebde09170d1e64400a968128c-32.png","ui_class":"supporter"},"white":{"id":496781,"ratings":{"version":5,"overall":{"rating":1049.386474609375,"deviation":63.029598236083984,"volatility":0.05999572575092316}},"username":"Play like DD","country":"de","ranking":17.48806770555165,"professional":false,"icon":"https://b0c2ddc39d13e1c0ddad-93a52a5bc9e7cc06050c1a999beb3694.ssl.cf1.rackcdn.com/6c785dd95e0d2f4af69ce1c5ab030bdd-32.png","ui_class":""}}},"sgf":"(;FF[4]\\nCA[UTF-8]\\nGM[1]\\nDT[2020-11-05]\\nPC[OGS: https://online-go.com/game/28073181]\\nGN[Friendly Match]\\nPB[voltrevo]\\nPW[Play like DD]\\nBR[15k]\\nWR[14k]\\nTM[600]OT[4x30 byo-yomi]\\nRE[B+30.5]\\nSZ[13]\\nKM[0.5]\\nRU[Japanese]\\nAB[dd]\\n;W[jd]\\n(;B[dk]\\n(;W[ik]\\n(;B[jj]\\n(;W[jk]\\n(;B[kk]\\n(;W[kl]\\n(;B[kj]\\n(;W[ll]\\n(;B[lk]\\n(;W[ji]\\n(;B[ij]\\n(;W[ii]\\n(;B[hj]\\n(;W[hk]\\n(;B[jh]\\n(;W[ki]\\n(;B[kh]\\n(;W[ih]\\n(;B[li]\\n(;W[ig]\\n(;B[ic]\\n(;W[jc]\\n(;B[id]\\n(;W[ie]\\n(;B[jf]\\n(;W[jg]\\n(;B[kg]\\n(;W[if]\\n(;B[je]\\n(;W[kd]\\n(;B[ke]\\n(;W[lf]\\n(;B[kf]\\n(;W[le]\\n(;B[lh]\\n(;W[lg]\\n(;B[jb]\\n(;W[kb]\\n(;B[ka]\\n(;W[ib]\\n(;B[ja]\\n(;W[ia]\\n(;B[ld]\\n(;W[lc]\\n(;B[kc]\\n(;W[gj]\\n(;B[hb]\\n(;W[hi]\\n(;B[gf]\\n(;W[gg]\\n(;B[fg]\\n(;W[gh]\\n(;B[fh]\\n(;W[fi]\\n(;B[ej]\\n(;W[fk]\\n(;B[fj]\\n(;W[ek]\\n(;B[ei]\\n(;W[gi]\\n(;B[cg]\\n(;W[hf]\\n(;B[ge]\\n(;W[he]\\n(;B[hd]\\n(;W[gd]\\n(;B[fd]\\n(;W[gc]\\n(;B[fc]\\n(;W[ff]\\n(;B[fe]\\n(;W[ef]\\n(;B[df]\\n(;W[eh]\\n(;B[dh]\\n(;W[eg]\\n(;B[dg]\\n(;W[ee]\\n(;B[el]\\n(;W[fl]\\n(;B[dl]\\n(;W[fm]\\n(;B[lb]\\n(;W[de]\\n(;B[ce]\\n(;W[ed]\\n(;B[ec]\\n(;W[dc]\\n(;B[cd]\\n(;W[fb]\\n(;B[eb]\\n(;W[db]\\n(;B[gb]\\n(;W[ea]\\n(;B[cc]\\n(;W[cb]\\n(;B[bb]\\n(;W[ba]\\n(;B[ab]\\n(;W[ca]\\n(;B[em]\\n(;W[dj]\\n(;B[di]\\n(;W[cj]\\n(;B[ck]\\n(;W[bk]\\n(;B[bj]\\n(;W[cl]\\n(;B[ci]\\n(;W[dm]\\n(;B[cm]\\n(;W[bl]\\n(;B[]\\n(;W[bm]\\n(;B[ak]\\n(;W[dm]\\n(;B[al]\\n(;W[ai]\\n(;B[cm]\\n(;W[bi]\\n(;B[am]\\n(;W[bg]\\n(;B[bh]\\n(;W[ah]\\n(;B[bf]\\n(;W[ch]\\n(;B[aj]\\n(;W[af]\\n(;B[ae]\\n(;W[ag]\\n(;B[bh]\\n(;W[ml]\\n(;B[mk]\\n(;W[aa]\\n(;B[bc]\\n(;W[]\\n(;B[ga]\\n(;W[hc]\\n(;B[ha]\\n(;W[fa]\\n(;B[]\\n(;W[]\\nC[Play like DD: Thx gg\\nvoltrevo: yep gg\\n]\\n)))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))"}`,
  );
}
