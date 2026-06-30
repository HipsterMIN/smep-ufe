<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>

<script type="text/javascript">

function mlSaveCert(){
	
	// 협의사항
	// 1. certbag 은 개별 파라미터가 아닌 하나의 object 형식으로 전달.
	// 2. 타겟 저장소의 경우 시작 부분에서 배열 형태로 전달.
	var certbag = {
		signcert : $("#signcert").val(),
		signpri  : $("#signpri").val(),
		kmcert 	 : $("#kmcert").val(),
		kmpri	 : $("#kmpri").val(),
	};
	
	var targetStorageArr = ["web", "hdd"]; 	
	magicline.uiapi.saveCertToStorage(certbag, targetStorageArr, mlSaveCertCallback);	
	return;
}

function mlSaveCertCallback(code, resultObj){
	
	// TODO : 저장 이후 액션	
	if(code==0){
		alert('저장되었습니다.\n 인증서 서명 페이지로 이동합니다');
		window.location.href="signedForm.jsp";
	}else{
		alert('인증서 저장 실패');
		window.location.reload();
	}
	
	return;	
}

function mlSetTestCert(){
	
	$("#signcert").val("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");
	$("#signpri").val("MIIFEDAaBggqgxqMmkQBDzAOBAjNa40Zhxq98QICBAAEggTwAKEvdRnJDS2W8KNSr2R7UojacYEQAmvmGkSmZPfP+uwa9dxCYJGd/bXH1DgoODKIdwxIz9FDm6UlfOF4pws3F1QRO6zmgdjwCPfoYaGGOO9ODTnxBRCAHlirj8syCcJfaVeYRqGYsx5r+B0HxgYkr2g40UzQMOHVAeCEVCXhUNHHnEy3GlqE9gxhqiQPJBlvj8N5ImQYwB2wFSYb9/bC5SwdQsdIx/jvqgcu72/v2tyFVEtN6WwcY+tjtPZULCc16qYOwr9xGPmz4aEhQfDQjXG2ikLUFrhvMsWxgXmwnj89CUkfKb1HqlWK/+nqO7lKA5oNhO8+qk54hzvYxSDkkwwBcWUs3nXqI+N6I9IneIpXQkelu5A8LGXM+YJkUjH/SgTUOCa8D9u7aCPAYMyc68Jz2VszRsiaZ/FgX49vJvearCGDID9J28Gc0R8FM8OQVinGJVmRrAvpf8athyrvJRsW9LJzju+6TTuD9ZPPeXisCWMmOjpSFkIYiMO/h7s+vTyneYqmvzE5JS4p8VlB9jrmYE1vmplwnAW+bXTunhLgtJXk0bkLwrvsXNs46e/U3uKNe5qwAHqKCMj4izDl0cjtKNI2THzP8WcREKfBnnKkXZE+ksz1SvoIgUUMFODtyOvZRDuCuLGSK10sN4TeNw2pn06c3w3bZwZZyoAdt9ciDz6PlCCtBcqCbsHHDz8/pzw8/9zdx4qsAibrCrdPMTinMmyNvBmYT/KnVU1yvPj2RkGUNSsfI2MObBQaSds57pkASiSMnXaRmfk5BlzicQAzoB5efcMVL5GFjl+DKa6LZhZBHyAt3/NurkjIfxeQ7I1qkkTIjV/aeWf24cSQ9/DST/esNxVGwPrRUs7KksWYEvD4yjavDSfi/UWiVOddNp8fI0jMID/3r1BcBkK9GqMhvt/FLF8cm5J5o4wIG0F8a6KGCLEyiAk9aJvH2ICbh3D0UXgvTx3dRnMx82IQmsEfbxMcAbQeSf12nNcVi6hEyAr+0SSt9vgVuWSN0sOzbhPLgW/rnJyC2tCk7xz7xZiEG5Pv4AXRjr5GlazXTR+qyl+jT4ppnojXBDQaw+WvImFLIexPB7US+5382szeRMERdCY2F5hyUBrInB6ztEtj8Y7yatzFPyRpomMpyaP3bv8gOe8oCGmxu92HSjxeQlc2rMjXmbkA/LFn/4BmaIAH60DhwhpOrDK+VMCdf9Gj6FMJqp/wP+BMcitdSJHm1mWl46dI/e7C0Xd4K3nJwJiuhvtF8LArsl7Zyn/50fww0qcsiyOhZvbwweuw6yEH9fOUWsLnkj9LgmwGAi+ySfq3mD3MvuIYky8Nwa/P1SFRhbY2GZVs33f+Qo9wcCo+d17o1Cpfj9wfb4UjrAbjfbn+vfroYol0McN2A/6QRTKaeYYOKp128gVT0bNvRC3tHk4tJbmvRC7d5CjqZ+NvSMIpXIw6GQ7pSSO3cDx1Aa+KqXFbj1uqAMdoiOPIn2greFVPuDhncf1Y4/vIvKaJpeAmTAXhd4ju9y7NKsH5Q9QsVgxe7nYZWzB7foFVzRDtRoI5mq5a1x1/0f3T7s2iBAN6APJSUJt57hY2ESWN4rS0GihnSHK9Iuez93WSJ2rn1y5MUB2Kp5PKCfuYJPOM4LykSlntT6CVHwnVZHqrHe32QLkTMtOrJBxauhkl+OZBgg==");
	$("#kmcert").val("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");
	$("#kmpri").val("MIIFEDAaBggqgxqMmkQBDzAOBAhNCk1zv5TMjQICBAAEggTwhFgQPBwlY8EAIT8a0iEjehB69MKs3AitBi0bJL10+ghf8fW+1qAZnQkFX5GyjKmZDDp2sp8Q+DlRnIwkJgA8BSI8R5fFIH/hcCbPu7cBDhpFALaoRs1KfXAm/GzdL8+W+nptO7V0sScmwbDKSg37fV2IkPv+CqdWJt3gCOV8wbLGy5Qc8cgpXygnikqHMyYfmwDeIuxiiVI3ttjVcGeTo0Py8sNY61PnJlFJWfNsA5oozT8U4ljgaNF6CIXIRvo0mk9+LUC3fDho5YBzuZaM5vMggeZmowtVqvyhbAV5D9/hPi3shWYqdt/HJeTPPJKg9LcIiwwihxN+/iF9Lb3WkpiSDjF3DwsNUEnKjAXzvbB7TifU+YLkJmEs+pffiXzg2ZCnD3quOdXIvTayxpf8RLWSQWkkK1Xf+zl87YoU/nxXoGvwPp4iAfbuEmrtQGp6WHofzdZfok0lZmocB/DiPRLkh59oCgcyZq9aOssUovwy6EEJ0vFAIMGVETHflvJ3StYilhhE0ma1iXuNiJ07TBhn633/ZZIMRSBzcxRtt0E9f26qR2s22F/xmUs39luIKbUWeIDeTj1Y/stsqU5Mkb9se0ircmw0Nhz3a66dtdBMLl4BqRKUDokzb6kfs90mrA9I2BiLhVYEoCySr87ZR7tNwlYFaLTQaaPRntXreq7K4v1sFgMG8z5pXRzlaXm3DALEI0S10JMrEwpTFh3DC1XarEUKvMQGxR4CHJga+twQC2+5QxO62+frNQ3hP8DtEuPEk6tGb7eh7tN2jw8Xv5szO+1q2CEouBxZjsX8s7j00rSxWxrm60tkSSYbbesZrWoGaYpdDs+Yavgr6insh3rAdp09T8gTGhDiWAEIkZ0udMQVDmEl0H3nG7w76HrfwmkQINBV0GmHRSe8hgt6ERf19Lk/PCmQMwSj7WSJz0nRl0nmTtz/OYHS/+2DprybdejVIh8oA2R49CCRZOOHVJIdbdapfJAMZrZdXWNjKuNHPvrLHN2+GEEPBOlsFJ8BBzEBzz1PwIgkWxGHzZvc3gbdZVzYT3rtS4A74Qo1kx4GCqgDx+vNJuzJT7JRPgkoWG0dp1epQ56L/R5uNB7fpAbk8tWXrjKL8FGOeDqq6lGvAq2hCZpg0bnR/vyq4km6GpDE32MoFGLjNVr9SZWD/4Y42Dnnhwo+MxQkiRhCA59XkWk5hA2gMoZA+yhJ6q8OmVqNb9cTGtP3D2gaW3AFP9CZqDy3WBxIiB5LSggam5a8HxX1i0plViLpB23S/99lnL0R7QmJmFgThdxyH6hHT5CalwR9uVH4LKMvqcGYuHKfsr2BZyL9OfkKJbC8jqRmqmtes5wWVfkca7A45Uvk+QarpXt29R1ehcRfP7AaRexPT57uqzNyhgmKit4fcMHq9pvtWTYpmHvkU+p103aKuOl3ReHgUnjb8u8Vx+qlTu/5rmDUkXdcXYtlzf+NuV4DeA4DQcJw4PLuLMEhUnbAkVCyE/yyvDY/50KFAwWGRBeIwevhB07FC++J0rwpDZklPHMr2Q6xfILkZwL5cTGRa+hRKmo9EVik2GDCGGdB8J7zQ5wRF9b9EB5KpxKw48uGokh65ytIRKCavYIvihaYlMYZ+SZloZj7JyINP3gyLVxetgE72M6cexDGMG6f3uHELAp6VP7MM/l1kBFoArDxvA==");
	
	return;
}

</script>
<div id="middle">
	<h2>MagicLine Save Certificate</h2>
	<div id="workArea"><!-- DIV START  -->
	
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>&nbsp;&nbsp;공개키와 개인키를 통해 인증서를 저장합니다.</td>
		</tr>
	</table>
	
	<p>&nbsp;</p>
	<form id='reqForm' name='reqForm' method='post' action="./signedFormR.jsp">
	<!-- 결과 수신 메시지  -->
	<input type="hidden" id="signOrigin" name="signOrigin" /> <!-- 180701 서명 원문 폼 추가 -->
	<input type="hidden" id='sign' name='sign'/>
	<input type="hidden" id='csCheckType' name='csCheckType' value="1"/>
	
	<!-- 전자서명 데이터 입력 영역 -->
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
			<tr>
				<th colspan="2">Client Digital Signature Information</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="formRow">
					<table class="normal" cellspacing="0" style="text-align: left;">
						<tr>
							<td>signcert<font class="required">*</font></td>
							<td>
								<textarea id="signcert" name="signcert" rows="3" cols="80"></textarea>
								<!-- <input class="text-box-big" id="signData" name="signData" type="text" value="">-->
							</td>
						</tr>
						<tr>
							<td>signpri<font class="required">*</font></td>
							<td>
								<textarea id="signpri" name="signpri" rows="3" cols="80"></textarea>
								<!-- <input class="text-box-big" id="signData" name="signData" type="text" value="">-->
							</td>
						</tr>
						<tr>
							<td>kmcert<font class="required">*</font></td>
							<td>
								<textarea id="kmcert" name="kmcert" rows="3" cols="80"></textarea>
								<!-- <input class="text-box-big" id="signData" name="signData" type="text" value="">-->
							</td>
						</tr>
						<tr>
							<td>kmpri<font class="required">*</font></td>
							<td>
								<textarea id="kmpri" name="kmpri" rows="3" cols="80"></textarea>
								<!-- <input class="text-box-big" id="signData" name="signData" type="text" value="">-->
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td colspan="2" class="buttonRow" align="center">
					<input id="aaa" type="button" class="button" value="저장" onclick="javascript:mlSaveCert();">
					&nbsp;
					<input id="bbb" type="button" class="button" value="초기화" onclick="javascript:mlSetTestCert();">
				</td>
			</tr>
		</tbody>
	</table>
	<br>
	</form>
	<p>&nbsp;</p>
	
	</div>
</div><!-- DIV END  -->
<div id="selectCertContainer1" style="width:100%;margin-top:0; display:none;"></div>
<div id="startCs" style="width:100%;margin-top:0; display:none;"></div>
<jsp:include page="include/footer.jsp"></jsp:include>

<script type="text/javascript">
$(window).load(function(){	
	mlSetTestCert();
});
</script>