package com.liuyao.app

import kotlin.random.Random
import org.json.JSONArray
import org.json.JSONObject

data class Hexagram(
    val number: Int, val name: String, val pinyin: String,
    val symbol: String, val judgment: String,
    val upper: Int, val lower: Int
)

data class HexagramResult(
    val lines: List<Int>, val hexagram: Hexagram,
    val changingHexagram: Hexagram?
)

object HexagramData {
    val list = listOf(
        Hexagram(1,"乾","qián","☰☰","天行健，君子以自强不息。",7,7),
        Hexagram(2,"坤","kūn","☷☷","地势坤，君子以厚德载物。",0,0),
        Hexagram(3,"屯","zhūn","☵☳","云雷屯，君子以经纶。",2,4),
        Hexagram(4,"蒙","méng","☶☳","山下出泉，蒙。君子以果行育德。",1,4),
        Hexagram(5,"需","xū","☵☰","云上于天，需。君子以饮食宴乐。",2,7),
        Hexagram(6,"讼","sòng","☰☳","天与水违行，讼。君子以作事谋始。",7,4),
        Hexagram(7,"师","shī","☷☳","地中有水，师。君子以容民畜众。",0,4),
        Hexagram(8,"比","bǐ","☵☷","地上有水，比。先王以建万国，亲诸侯。",2,0),
        Hexagram(9,"小畜","xiǎo xù","☴☰","风行天上，小畜。君子以懿文德。",5,7),
        Hexagram(10,"履","lǚ","☰☱","上天下泽，履。君子以辨上下，定民志。",7,6),
        Hexagram(11,"泰","tài","☷☰","天地交，泰。后以财成天地之道，辅相天地之宜。",0,7),
        Hexagram(12,"否","pǐ","☰☷","天地不交，否。君子以俭德辟难，不可荣以禄。",7,0),
        Hexagram(13,"同人","tóng rén","☰☲","天与火，同人。君子以类族辨物。",7,5),
        Hexagram(14,"大有","dà yǒu","☲☰","火在天上，大有。君子以遏恶扬善，顺天休命。",5,7),
        Hexagram(15,"谦","qiān","☷☶","地中有山，谦。君子以裒多益寡，称物平施。",1,0),
        Hexagram(16,"豫","yù","☷☳","雷出地奋，豫。先王以作乐崇德，殷荐之上帝。",0,1),
        Hexagram(17,"随","suí","☱☳","泽中有雷，随。君子以向晦入宴息。",0,6),
        Hexagram(18,"蛊","gǔ","☶☴","山下有风，蛊。君子以振民育德。",1,5),
        Hexagram(19,"临","lín","☷☱","泽上有地，临。君子以教思无穷，容保民无疆。",0,6),
        Hexagram(20,"观","guān","☴☷","风行地上，观。先王以省方观民设教。",5,0),
        Hexagram(21,"噬嗑","shì kè","☲☳","雷电噬嗑，先王以明罚敕法。",5,1),
        Hexagram(22,"贲","bì","☶☲","山下有火，贲。君子以明庶政，无敢折狱。",1,5),
        Hexagram(23,"剥","bō","☶☷","山附于地，剥。上以厚下安宅。",1,0),
        Hexagram(24,"复","fù","☷☳","雷在地中，复。先王以至日闭关。",0,1),
        Hexagram(25,"无妄","wú wàng","☰☳","天下雷行，物与无妄。先王以茂对时育万物。",7,1),
        Hexagram(26,"大畜","dà xù","☶☰","天在山中，大畜。君子以多识前言往行，以畜其德。",1,7),
        Hexagram(27,"颐","yí","☶☳","山下有雷，颐。君子以慎言语，节饮食。",1,1),
        Hexagram(28,"大过","dà guò","☱☴","泽灭木，大过。君子以独立不惧，遁世无闷。",6,5),
        Hexagram(29,"坎","kǎn","☵☵","水洊至，习坎。君子以常德行，习教事。",2,2),
        Hexagram(30,"离","lí","☲☲","明两作，离。大人以继明照于四方。",5,5),
        Hexagram(31,"咸","xián","☱☶","山上有泽，咸。君子以虚受人。",6,1),
        Hexagram(32,"恒","hèng","☳☴","雷风恒，君子以立不易方。",1,6),
        Hexagram(33,"遁","dùn","☰☶","天下有山，遁。君子以远小人，不恶而严。",1,7),
        Hexagram(34,"大壮","dà zhuàng","☳☰","雷在天上，大壮。君子以非礼弗履。",7,1),
        Hexagram(35,"晋","jìn","☲☷","明出地上，晋。君子以自昭明德。",5,0),
        Hexagram(36,"明夷","míng yí","☷☲","明入地中，明夷。君子以莅众，用晦而明。",0,5),
        Hexagram(37,"家人","jiā rén","☴☲","风自火出，家人。君子以言有物而行有恒。",5,1),
        Hexagram(38,"睽","kuí","☲☱","上火下泽，睽。君子以同而异。",1,5),
        Hexagram(39,"蹇","jiǎn","☶☵","山上有水，蹇。君子以反身修德。",1,2),
        Hexagram(40,"解","xiě","☵☳","雷雨作，解。君子以赦过宥罪。",2,1),
        Hexagram(41,"损","sǔn","☶☱","山下有泽，损。君子以惩忿窒欲。",1,6),
        Hexagram(42,"益","yì","☴☳","风雷益，君子以见善则迁，有过则改。",5,1),
        Hexagram(43,"夬","guài","☱☰","泽上于天，夬。君子以施禄及下，居德则忌。",7,6),
        Hexagram(44,"姤","gòu","☰☴","天下有风，姤。后以施命诰四方。",7,5),
        Hexagram(45,"萃","cuì","☱☷","泽上于地，萃。君子以除戎器，戒不虞。",6,0),
        Hexagram(46,"升","shēng","☷☴","地中生木，升。君子以顺德，积小以高大。",0,5),
        Hexagram(47,"困","kùn","☱☵","泽无水，困。君子以致命遂志。",6,2),
        Hexagram(48,"井","jǐng","☵☴","木上有水，井。君子以劳民劝相。",2,5),
        Hexagram(49,"革","gé","☱☲","泽中有火，革。君子以治历明时。",6,5),
        Hexagram(50,"鼎","dǐng","☲☴","木上有火，鼎。君子以正位凝命。",5,1),
        Hexagram(51,"震","zhèn","☳☳","洊雷，震。君子以恐惧修省。",1,1),
        Hexagram(52,"艮","gèn","☶☶","兼山，艮。君子以思不出其位。",1,1),
        Hexagram(53,"渐","jiàn","☴☶","山上有木，渐。君子以居贤德善俗。",1,5),
        Hexagram(54,"归妹","guī mèi","☱☳","泽上有雷，归妹。君子以永终知敝。",6,1),
        Hexagram(55,"丰","fēng","☳☲","雷电皆至，丰。君子以折狱致刑。",1,5),
        Hexagram(56,"旅","lǚ","☲☶","山上有火，旅。君子以明慎用刑而不留狱。",1,5),
        Hexagram(57,"巽","xùn","☴☴","随风，巽。君子以申命行事。",5,5),
        Hexagram(58,"兑","duì","☱☱","丽泽，兑。君子以朋友讲习。",6,6),
        Hexagram(59,"涣","huàn","☴☵","风行水上，涣。先王以享于帝立庙。",5,2),
        Hexagram(60,"节","jié","☱☵","泽上有水，节。君子以制数度，议德行。",6,2),
        Hexagram(61,"中孚","zhōng fú","☴☱","泽上有风，中孚。君子以议狱缓死。",5,6),
        Hexagram(62,"小过","xiǎo guò","☳☶","山上有雷，小过。君子以行过乎恭，丧过乎哀，用过乎俭。",1,5),
        Hexagram(63,"既济","jì jì","☵☲","水在火上，既济。君子以思患而预防之。",5,2),
        Hexagram(64,"未济","wèi jì","☲☵","火在水上，未济。君子以慎辨物居方。",2,5),
    )

    fun find(upper: Int, lower: Int): Hexagram? =
        list.find { it.upper == upper && it.lower == lower }
}

object HexagramEngine {
    fun toss(): HexagramResult {
        val lines = List(6) {
            (0..2).sumOf { if (Random.nextFloat() > 0.5f) 3 else 2 }
        }
        return computeResult(lines)
    }

    fun computeResult(lines: List<Int>): HexagramResult {
        val lb = lines.map { if (it == 7 || it == 9) 1 else 0 }
        val lN = (lb[2] shl 2) or (lb[1] shl 1) or lb[0]
        val uN = (lb[5] shl 2) or (lb[4] shl 1) or lb[3]
        val hx = HexagramData.find(uN, lN)!!
        val hasCh = lines.any { it == 6 || it == 9 }
        val ch = if (hasCh) {
            val cb = lb.mapIndexed { i, b -> if (lines[i] == 6 || lines[i] == 9) 1 - b else b }
            val clN = (cb[2] shl 2) or (cb[1] shl 1) or cb[0]
            val cuN = (cb[5] shl 2) or (cb[4] shl 1) or cb[3]
            HexagramData.find(cuN, clN)
        } else null
        return HexagramResult(lines, hx, ch)
    }

    fun toJson(r: HexagramResult): String = JSONObject().apply {
        put("lines", JSONArray(r.lines))
        put("name", r.hexagram.name)
        put("symbol", r.hexagram.symbol)
        put("judgment", r.hexagram.judgment)
        r.changingHexagram?.let { ch ->
            put("changingName", ch.name)
            put("changingSymbol", ch.symbol)
        }
    }.toString()
}
