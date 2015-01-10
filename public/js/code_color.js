function isAlpha(input)
{
	return ('A' <= input && input <= 'Z') || ('a' <= input && input <= 'z') || (input == '_');
}
function isSpace(input)
{
	return input == ' ' || input == '	' || input == '>' || input == '{' || input == '}' || input == ';' || input == '\n' || input == '.' || input == '#' || input =='<' || input == '(' || input == ')' || input == '=' || input == ',';
}
function color(input,code)
{
	var id = '#'+input;
	$(id).addClass("code");
// 	var code = $(id).text();
	var len = code.length;
	var aft_sharp = ["include","define"];
	var var_type = ["struct","void","int","long","short","unsigned","float","double","bool","char","class"];
	var stt = ["if","else","for","while","do","const","case","switch","return","public","private","operator","and","or","not","xor","using","break","continue"];
	var bln = ["true","false"];
	var sp_word = [aft_sharp];
	sp_word.push(var_type);
	sp_word.push(stt);
	sp_word.push(bln);
	var idx_sp = ["aft_sharp","var_type","stt","number"];
	var per_str = ['d','c','e','f','g','o','p','s','u','x','i','E','G','X'];
	var new_code = "";
	var word = "";
	var bkt = [0]; // () {} [] "" ''
	bkt.push(0);
	bkt.push(0);
	bkt.push(0);
	bkt.push(0);
	mem_inc = 0;
	mem_def = 0;
	mem_per = 0;
	for(i = 0; i < len; i++)
	{
		chk = 0;
		lp = 0;
		if(code[i]=='{')
			bkt[1]++;
		if(code[i]=='}')
			bkt[1]--;
		if(chk==0&&!isAlpha(code[i-1]))
		{
			while(lp < 4 && !chk)
			{
				for(j = 0; j < sp_word[lp].length && !isAlpha(code[i-1]); j++)
				{
					if(code.substring(i,sp_word[lp][j].length+i)==sp_word[lp][j])
					{
						if(!isAlpha(code[sp_word[lp][j].length+i]))
						{
							if(sp_word[lp][j]=="include")mem_inc=1;
							else if(sp_word[lp][j]=="define")mem_def=1;
							tmp_cls = idx_sp[lp];
							chk = 1;
							word = "<span class='code "+tmp_cls+"'>"+sp_word[lp][j]+"</span>";
							i+=sp_word[lp][j].length-1;
							break;
						}
					}
				}
				lp++;
			}
		}
		if(chk==0)
		{
			if(!isAlpha(code[i-1])&&'0'<=code[i]&&code[i]<='9'&&bkt[3]==0&&bkt[4]==0)
			{
				j = i;
				while('0'<=code[j]&&code[j]<='9')
				{
					j++;
				}
				word = "<span class='code number'>"+code.substring(i,j)+"</span>";
				i=j-1;
				chk=1;
			}
			else if(code[i]=='\"'&&code[i-1]!='\\')
			{
				if(bkt[3]==0)
				{
					word = "<span class='code str'>\"";
					chk=1;
					bkt[3]++;
				}
				else
				{
					word = "\"</span>";
					chk=1;
					bkt[3]--;
				}
			}
			else if(code[i]=='\''&&code[i-1]!='\\')
			{
				if(bkt[4]==0)
				{
					word = "<span class='code str'>\'";
					chk=1;
					bkt[4]++;
				}
				else
				{
					word = "\'</span>";
					chk=1;
					bkt[4]--;
				}
			}
			if(code[i]=='%'&&(bkt[3]==1||bkt[4]==1))
			{
				mem_per = 1;
				word = "<span class='code per_str'>%";
				chk=1;
			}
			if(mem_per==1)
			{
				for(j = 0; j < per_str.length; j++)
				{
					if(code[i]==per_str[j])
					{
						mem_per=0;
						break;
					}
				}
				if(mem_per==0)
				{
					word = code[i]+"</span>";
					chk=1;
				}
			}
			if(code[i]=='/'&&code[i+1]=='/')
			{
				word = "<span class='code comment'>";
				j = i;
				while(code[j+1]!='\n')
				{
					word+=code[j];
					j++;
				}
				i = j;
				word+=code[j]+"</span>";
				chk=1;
			}
			if(code[i]=='/'&&code[i+1]=='*')
			{
				word = "<span class='code comment'>";
				j = i;
				while(code[j]!='EOF')
				{
					word+=code[j];
					j++;
					if(code[j-1]=='*'&&code[j]=='/')
						break;
				}
				i = j;
				word+="/</span>";
				chk=1;
			}
		}
		if(chk==0 && mem_def==1)
		{
			if(isAlpha(code[i]))
			{
				j = i;
				while(isAlpha(code[++j]));
				word = "<span class='code def'>"+code.substring(i,j)+"</span>";
				i = j-1;
				mem_def=0;
				chk = 1;
			}
		}
		if(chk==0 && mem_inc==1)
		{
			if(code[i]=='<'&&code[i+1]!='<')
			{
				j=i;
				chk=1;
				while(code[++j]!='>')
				{
					if(code[j]==';')
					{
						chk=0;
						break;
					}
				}
				if(chk==1)
				{
					word = "<span class='code lib'>&lt"+code.substring(i+1,j+1)+"</span>";
					i=j;
					mem_inc = 0;
				}
			}
		}
		if(chk==0 && bkt[1]>0)
		{
			if(isSpace(code[i-1])&&isAlpha(code[i]))
			{
				j=i;
				while(code[++j]!='(')
				{
					if(!isAlpha(code[j]))
					{
						chk=0;
						break;
					}
					if(code[j]==';')
					{
						chk=0;
						break;
					}
					chk=1;
				}
				if(chk==1)
				{
					word = "<span class='code call_func'>"+code.substring(i,j)+"</span>";
					i=j-1;
				}
			}
		}
		if(chk==0 && bkt[1]==0)
		{
			if(i==0||isSpace(code[i-1])&&isAlpha(code[i]))
			{
				j=i+1;
				while(code[++j]!='(')
				{
					if(!isAlpha(code[j]))
					{
						chk=0;
						break;
					}
					if(code[j]==';')
					{
						chk=0;
						break;
					}
					chk=1;
					mem_def=0;
				}
				if(chk==1)
				{
					word = "<span class='code def_func'>"+code.substring(i,j)+"</span>";
					i=j-1;
				}
			}
		}
		if(chk==0)
		{
			word = code[i];
			if(code[i]=='<')
				word = "&lt";
		}
		new_code+=word;
	}
	$(id).html(new_code);
}